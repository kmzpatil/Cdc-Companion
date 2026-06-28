import argparse
import csv
import os
import sys
from datetime import datetime

try:
    import psycopg
    from psycopg.rows import dict_row
    _PSYCOPG_VERSION = 'psycopg'
except ImportError:
    try:
        import psycopg2
        import psycopg2.extras
        _PSYCOPG_VERSION = 'psycopg2'
    except ImportError:
        _PSYCOPG_VERSION = None

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


def ensure_db_driver():
    if _PSYCOPG_VERSION is None:
        raise RuntimeError(
            "Missing Postgres driver. Install one of:\n"
            "  pip install psycopg[binary]\n"
            "or\n"
            "  pip install psycopg2-binary\n"
        )
    return _PSYCOPG_VERSION


def format_value(value):
    if value is None:
        return ''
    if isinstance(value, bool):
        return str(value)
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat(sep=' ', timespec='seconds')
    if isinstance(value, (list, tuple)):
        return ' | '.join(str(item) for item in value)
    if isinstance(value, dict):
        return str(value)
    return str(value)


def write_csv(path, fieldnames, rows):
    with open(path, 'w', newline='', encoding='utf-8') as out_file:
        writer = csv.writer(out_file, quoting=csv.QUOTE_ALL)
        writer.writerow(fieldnames)
        for row in rows:
            writer.writerow([format_value(row.get(field)) for field in fieldnames])


def fetch_rows(conn, query, fieldnames):
    if _PSYCOPG_VERSION == 'psycopg':
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(query)
            return cur.fetchall()
    else:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(query)
            return cur.fetchall()


def export_all(conn, output_dir):
    os.makedirs(output_dir, exist_ok=True)

    tables = ["Reviewee", "Reviewer", "Review", "Admin"]
    for table in tables:
        query = f'SELECT * FROM "{table}" ORDER BY "id"'
        if _PSYCOPG_VERSION == 'psycopg':
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute(query)
                rows = cur.fetchall()
                fieldnames = [desc.name for desc in cur.description]
        else:
            import psycopg2.extras
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(query)
                rows = cur.fetchall()
                fieldnames = [desc.name for desc in cur.description]
        write_csv(os.path.join(output_dir, f'{table.lower()}s.csv'), fieldnames, rows)

    print(f'Export complete. CSV files written to: {output_dir}')


def build_parser():
    parser = argparse.ArgumentParser(
        description='Export PostgreSQL tables from the CDC Companion schema to CSV files.'
    )
    parser.add_argument(
        '--database-url', '-d',
        help='Postgres DATABASE_URL (overrides environment DATABASE_URL)',
    )
    parser.add_argument(
        '--out-dir', '-o',
        default='exports',
        help='Output directory for CSV files (default: exports)',
    )
    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    db_url = args.database_url or os.getenv('DATABASE_URL')
    if not db_url:
        print('Error: DATABASE_URL is not set and --database-url was not provided.')
        sys.exit(1)

    driver = ensure_db_driver()

    try:
        if driver == 'psycopg':
            conn = psycopg.connect(db_url)
        else:
            conn = psycopg2.connect(db_url)
    except Exception as exc:
        print(f'Error connecting to the database: {exc}')
        sys.exit(1)

    try:
        export_all(conn, args.out_dir)
    except Exception as exc:
        print(f'Export failed: {exc}')
        sys.exit(1)
    finally:
        conn.close()


if __name__ == '__main__':
    main()
