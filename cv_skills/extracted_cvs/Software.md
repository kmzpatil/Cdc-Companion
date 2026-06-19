### 💻 Software Development Engineering (SDE) CV Evaluation Directives

#### 1. Core Technical Formatting & Syntax Rules
SDE reviewers are highly critical of how technical skills are mapped to actual business or system impact, as well as the overall visual and syntactic hygiene of the CV. Your agent must aggressively flag these common pitfalls:

*   **The "Orphaned Skill" Filter:** Flag any CV that lists languages or frameworks (e.g., React, Next.js, FastAPI, LangGraph) in a "Skills" section but fails to explicitly mention them in the project or experience bullets. The agent must prompt: *"Where did you actually use [Skill]?"*
*   **Impact vs. Task Distinction:** Flag passive bullets ("Worked on the frontend API") and rewrite them using the XYZ formula: *"Architected a [Feature] using [Tech Stack], reducing [Metric/Latency] by X%."* Every bullet point must start with a strong, diverse action verb (parallel structure) selected from standard engineering guides (e.g., "Architected", "Engineered", "Optimized", "Spearheaded", "Implemented"). Avoid repetitive verbs across consecutive bullets (e.g., do not use "Implemented" or "Developed" to start multiple consecutive points).
*   **Link Integrity & Completeness:** Ensure GitHub, portfolio, and competitive programming profiles are hyperlinked correctly and placed prominently at the top. Prefer a single, clean global GitHub profile link at the top of the CV rather than cluttering individual project headers with raw URLs. For frontend or full-stack projects, strongly recommend adding live deployment links (e.g., Vercel, Render, Netlify) to showcase project completeness.
*   **Raw Link Elimination:** Flag and remove raw URL strings (e.g., `https://github.com/...` or "Link to repository is...") within bullet points or project headers. They clutter the layout and increase white space. Instead, use clean hyperlinks on the project title or remove them entirely to focus on technical descriptions.
*   **The Line-Completion (Zero White Space) Rule:** SDE CVs must look balanced, dense, and completely filled. 
    *   **The Single-Line Bullet Rule:** Strictly require that *every* project, experience, and achievement bullet point fits on exactly *one* line to maximize density and readability. If a point exceeds one line, break it into two distinct, high-impact single-line bullets, or aggressively shorten it.
    *   If a bullet point must wrap to a second line, ensure the second line also extends across at least 90% of the page width to avoid "orphaned words" or trailing white space.
    *   Apply this 90%+ line-completion rule to the "Skills and Expertise", "Competition/Conference", and "Coursework" sections as well—do not leave large empty gaps on the right side of these rows. Suggest rephrasing, expanding acronyms (e.g., rewriting "OOP" to "Object-Oriented Programming"), or adding technical details to fill the space.
    *   Ensure the page is completely filled vertically. If the CV looks empty at the bottom, expand project descriptions, add open-source contributions, or list relevant coursework/certifications.
    *   **No Trailing Empty Lines:** Strictly forbid trailing empty lines or free lines at the end of the CV. The page must end cleanly with the last section's content.
*   **Bolding Consistency & Hygiene:** 
    *   Ensure bolding is applied uniformly and only to high-signal elements (e.g., specific tools, frameworks, algorithms, and key metrics). 
    *   Bold at least 2-3 high-signal terms, metrics, or technologies per bullet point. 
    *   Ensure bolding is applied consistently across all sections, including "Awards & Achievements" and "Extra-Curricular Activities." Do not leave any bullet point completely unbolded, and flag random or excessive bolding that disrupts readability.
    *   Do not bold entire phrases, low-signal words, prepositions, or conjunctions (e.g., "of", "and", "in") within bolded phrases.
    *   Ensure bold text does not render at an inconsistent or excessively large font size compared to normal text on ERP platforms; bolding should look visually integrated and natural.
*   **Grammar, Punctuation, and Action Verb Diversity:** 
    *   Ensure every bullet point ends with a period (full stop) consistently across all sections (including Awards, POR, and ECA).
    *   Flag repetitive action verbs. Suggest diverse, strong engineering verbs.
    *   Eliminate typos, grammatical errors, double words (e.g., "platform platform"), and placeholder text (e.g., "M.Tech. in AVAILABLE SPECIALISATION").
    *   Flag typographical spacing errors, such as missing spaces around ampersands (e.g., "carbon &water" instead of "carbon & water"), slashes, commas (e.g., "Balanced,Unfiltered" instead of "Balanced, Unfiltered"), or punctuation marks.
*   **Visual Hierarchy & Spacing Consistency:** 
    *   Ensure uniform vertical spacing and gaps under all section headers. Eliminate weird gaps between points caused by ERP portal spacing.
    *   Font sizes must follow a strict hierarchy where section headers are distinct, and titles (such as project or experience names) are never smaller than the body text.
    *   Ensure there is exactly one space between the bullet point symbol (e.g., `•`) and the first word of the bullet.
    *   Ensure proper indentation so that wrapped lines align perfectly with the start of the text block, not under the bullet symbol.
    *   **Date Formatting & Right-Alignment:** Project, internship, and experience dates must be enclosed in square brackets (e.g., `[Jun '25]`), pushed to the extreme right margin, and perfectly aligned vertically. Dates must never be left unindented or floating in the middle of the line. Use a consistent date format throughout the CV and avoid unnecessary apostrophes (e.g., use `[Jun '25]` or `[Jun 25]` consistently, but avoid `[Jun' 2025]` or parentheses like `(June 2025)`). Use standard 3-letter month abbreviations (e.g., `[Jan '25 - Feb '25]`). Flag and correct missing spaces inside date brackets (e.g., change `[Mar'25- Apr'25]` to `[Mar '25 - Apr '25]`).
    *   **Separator Spacing:** Ensure exactly one space before and after pipe (`|`) separators in headers and skills sections (e.g., fix `MINDFLIX| OpenSoft` to `MINDFLIX | OpenSoft` and `Pandas| Matplotlib` to `Pandas | Matplotlib`).
    *   **Meta-Language Elimination:** Strictly eliminate introductory meta-language prefixes or standalone lines such as "Overview:", "Project Description:", "Objective:", or "Problem Statement:" in Work Experience, Projects, or Competitions. The bullet points themselves must convey the context and technical details directly.
    *   **Uniform Character Size:** Ensure font sizes are completely uniform across similar elements (e.g., all body text, all bullet points, all headers). No random scaling or ERP-induced size variations.
    *   **Hyphenation Consistency:** Standardize terms like "Full-stack" vs "full stack", "MERN-stack" vs "MERN stack", "front-end" vs "frontend".
    *   **Spacing around Ampersands & Symbols:** Fix spacing around ampersands (e.g., "Frameworks & Tools" instead of "Frameworks &Tools" or "Frameworks  & Tools").
    *   **Intra-word Spacing Errors:** Flag and correct accidental spaces within words or technical terms (e.g., change `Node. js` to `Node.js`, `Express. js` to `Express.js`, `INDUSTR IAL ENG INEER ING` to `INDUSTRIAL ENGINEERING`).

---

#### 2. SDE-Specific Keyword & Content Matching
The agent should scan for and elevate the following high-signal engineering experiences:

*   **Competitive Programming & Hackathons:** The agent must explicitly parse for platform handles (e.g., Codeforces, LeetCode, CodeChef, AtCoder) and highlight specific rank progressions.
    *   *Standardized Format:* Platform: handle (Peak Rating, Global Ranks, e.g., "Codeforces: Specialist (Peak Rating: 1511), Global Rank 514 in Round 1029").
    *   **Handle Mandate:** Always require the platform handle alongside the rating/rank for *every* platform mentioned (e.g., Codeforces, CodeChef, LeetCode).
    *   **Split Platform Achievements:** Recommend splitting combined platform achievements into separate, distinct bullet points (e.g., one bullet for Codeforces and another for CodeChef) to maximize visual impact, readability, and line density.
    *   Highlight reaching Pupil, Specialist, Expert, Master, 5-Star, 6-Star, or Kyu status, or achieving top global ranks out of large participant pools (e.g., top 1% of 30,000+ participants). Bold the rank tier (e.g., **Pupil**, **Specialist**, **Expert**, **Master**, **6-Star**, **2-Kyu**).
    *   Elevate 2-digit, 3-digit, or highly competitive 4-digit (under 4,000) global ranks in highly competitive contests. Serialize achievements chronologically.
    *   If the candidate has exceptional competitive programming stats, consider creating a dedicated "Competition/Conference" section to showcase these achievements and fill vertical space cleanly.
*   **Systems & Architecture Depth:** Look for evidence of low-level troubleshooting and scalability. Reward bullets that mention kernel-level optimizations, memory management, Linux system customization, multi-threading (e.g., mutexes, semaphores, condition variables, thread-safe queues, shared memory), custom compilers, custom network protocols (e.g., reliable flow control over UDP), or handling high-frequency/low-latency data streams.
*   **Modern AI & Agentic Frameworks:** If the candidate mentions AI, the agent should check for architectural depth. Differentiate between someone who just "called the OpenAI API" versus someone who orchestrated multi-agent systems using LangChain, handled vector embeddings (e.g., Pinecone, Milvus), implemented Retrieval-Augmented Generation (RAG), or optimized prompt latency.
*   **Deployment & CI/CD Pipeline:** Reward explicit mentions of how code was shipped. Look for Docker containerization, AWS/GCP deployments (e.g., AWS S3, AWS EC2, GCP Cloud Run), GitHub Actions, and automated testing frameworks (e.g., Jest, unittest, Catch2, Mocha/Chai).
*   **High-Signal Skill Filtering:** 
    *   Flag and recommend removing basic/foundational skills like "HTML" and "CSS" from the core skills section for advanced SDE roles, or mark them clearly as elementary/familiar. Prioritize modern frameworks (React, Next.js, FastAPI, Express.js, Spring Boot).
    *   Avoid redundant or repetitive skill listings (e.g., listing both "MongoDB" and "Mongoose" in the same line).
    *   Remove soft qualifiers like "Familiar", "Intermediate", or "Proficient" within the skills section to present a cleaner, more confident technical profile. If qualifiers are absolutely necessary, italicize them (e.g., *Proficient*, *Familiar*) and ensure proper spacing.
    *   Remove generic, non-technical tools (e.g., "MS Office", "Canva", "Sublime Text", "Figma") from the skills section to keep the profile strictly professional.
    *   Do not list hardware-specific tools (e.g., "Xilinx Vivado", "Cadence Virtuoso", "LTspice", "FreeCAD") in the core software skills section unless applying for hardware/embedded roles. Separate "Software" and "Hardware/Other Tools" into distinct lines or sections.
    *   **Skills Section Layout:** Group skills into 3 distinct lines: "Programming Languages", "Frameworks & Libraries", and "Tools & Platforms" for better readability. Use commas instead of pipes (`|`) to separate skills if space is tight, ensuring the section fits into fewer, well-balanced lines.
    *   **Add Industry-Standard Tools:** Ensure the tools section lists modern development, deployment, and testing tools (e.g., Docker, Kubernetes, AWS, GCP, Git, Postman) rather than just basic IDEs or generic software.
    *   **No Conceptual Terms in Skills:** Strictly forbid listing conceptual terms (e.g., "OOP", "OOPS", "STL", "C++ Standard Template Library", "Algorithm Design") under the "Frameworks & Libraries" or "Skills" section. These are concepts, not frameworks.
*   **ATS Optimization & Terminology:** Actively integrate high-signal technical keywords and modern software engineering terminology (e.g., "SOLID principles", "design patterns", "clean architecture", "index-free adjacency", "connection pooling", "caching", "2PL protocol", "serializability") instead of generic terms like "OOPs" or "good practices."

---

#### 3. Section-Specific Architecture & Hierarchy

*   **Section Ordering:**
    *   The standard high-priority order for SDE roles is: **Education** -> **Work Experience / Internships** -> **Competitions/Conferences** (if strong CP/Hackathon stats exist) -> **Projects** -> **Awards & Achievements** -> **Skills & Expertise** -> **Coursework** -> **Positions of Responsibility (POR)** -> **Extra-Curricular Activities (ECA)**.
    *   Highly prestigious academic awards (e.g., JEE Advanced/Mains ranks, Olympiads, KVPY, branch changes) should be placed high up (just before or after Projects) to maximize immediate impact.
*   **Education & Standardized Ranks:**
    *   Ensure the "Education" section lists actual school/college names rather than just the board (e.g., "CBSE" or "TSBIE" are boards, not institutes).
    *   For Indian engineering candidates, ensure national standardized exam ranks (e.g., JEE Advanced, JEE Mains ranks/percentiles) are prominently displayed.
    *   Standardize candidate pool numbers using "K+" or "M+" instead of exact raw numbers, tildes, or word-based representations (e.g., "250K+ candidates" instead of "0.25 million" or "2.5 Lakh"; "1.2M+ candidates" instead of "1.2 million").
    *   Eliminate informal or colloquial phrasing (e.g., "DepC CGPA" or "Branch Change CG"). Frame academic achievements formally (e.g., *"Earned a merit-based branch upgrade to Computer Science and Engineering by ranking in the top 10% of the batch"*).
    *   **M.Tech Specialization:** Never leave placeholder text like "M.Tech. in AVAILABLE SPECIALISATION". Replace with the actual planned specialization or remove the M.Tech line if not applicable.
    *   **JEE Ranks Mandate:** For Indian candidates, JEE Advanced and JEE Mains ranks/percentiles are *mandatory* and must be prominently displayed in the Awards or Education section.
*   **Internship & Work Experience Elevation:** 
    *   High-value technical programs (even short-term, highly selective programs like the Optiver Future Focus Program or JPMorgan Women in Quantitative Finance Mentorship) should be elevated to the "Internships" or "Work Experience" section rather than "Certifications" to maximize impact. Ensure internship listings include the location.
    *   For research internships or projects, use clean headers (e.g., "Project Name | Prof. Name, Institution") and avoid cluttered subtitles.
    *   Do not include redundant timeline descriptions in the bullet points (e.g., "Completed a 6-month mentorship") when the date range is already clearly visible in the section header. Use that space to expand on technical impact.
*   **Project Diversity, Duration, and Structure:**
    *   *Ordering:* Order projects chronologically (latest to oldest) or by confidence/relevance to the target SDE role. Create tailored versions of the CV based on the target role: for systems/HFT roles, place low-level systems/C++ projects at the top; for general software engineering roles (e.g., Google, Microsoft), place advanced full-stack, web, or application-level projects at the top.
    *   *Duration:* Flag projects that show a duration of only 1 month (e.g., `[Mar '22]` or `[Jan '22]`), as they appear brief and light. Recommend expanding the scope or description to reflect a span of at least 2 months (e.g., change `[May '25]` to `[May '25 - Jun '25]`).
    *   *Type:* Explicitly label project types (e.g., "Self Project", "Course Project", "Research Project") to show academic or guided rigor, but omit "Self Project" if space is extremely tight and the context is obvious.
    *   *Structure:* Limit projects to a maximum of 4. Having 5+ projects clutters the CV and dilutes impact. Ensure every project has at least 3-4 high-impact bullet points; single-bullet or double-bullet entries look incomplete.
    *   *No Meta-Language:* Strictly eliminate "Objective:" or "Problem Statement:" lines or headers. Instead, the first bullet point of every project must serve as the project's introduction, clearly defining the core problem solved, the motivation, and the engineering context using a strong action verb.
    *   *No Clutter:* Do not list technologies in the project title as a messy string (e.g., `Project Name | C++`). If technologies are included in the title, use a clean, standardized format: `Project Name | Tech Stack` (e.g., `Rubiks Cube Solver | C++, Korf's IDA*, OOP`). Otherwise, weave them naturally into the bullet points. Avoid excessive parenthetical details or trailing asterisks that clutter the line.
    *   *Avoid Intricate Code Details:* Do not list highly specific internal code details (e.g., specific class names like `Problem`, `UserProfile`, or minor helper modules) in brackets. Keep descriptions high-level, focusing on system architecture, algorithms, and performance.
    *   *Content:* Skip obvious/trivial tasks (e.g., basic data cleaning, preprocessing) and focus on high-value engineering (e.g., feature engineering, custom mathematical formulations, performance improvements over baselines).
    *   *Reframing Simple Projects:* If a project is technically simple (e.g., a basic smart wheelchair or a simple HTML site), reframe the bullet points by highlighting advanced engineering aspects, specific algorithms, mathematical formulations, or additional tech stack integrations.
    *   *Diversity & Cliché Filter:* Avoid repetitive projects (e.g., listing three basic MERN-stack web apps). Encourage a mix of systems, algorithms, and web development. Flag overly common/cliché projects (e.g., basic "Rubik's Cube Solver", "Library Management System", "Weather App", "Hospital Management System", "CLI Diet/Payroll Managers", "Movie Ticket Management System") and recommend replacing them with unique systems, compilers, or advanced full-stack/AI projects. If kept, they must explicitly detail the exact languages, frameworks, and APIs used and how they assisted.
    *   *DIY/Hardware Projects:* For pure SDE roles, demote or remove hardware-heavy/embedded projects (e.g., self-balancing robots, gesture-controlled cars, Arduino boats, Bluetooth-controlled unicopters) unless needed as fillers. Replace them with pure software, systems, or advanced full-stack/AI projects.
    *   *Tech Stack Accuracy:* Ensure the "Technology Stack" or "Libraries" line of a project contains *only* actual technologies (languages, frameworks, databases, APIs). Do not list conceptual terms (e.g., "OOP", "STL", "Algorithm Design") or payment gateways (e.g., "Razorpay") as tech stacks.
    *   *Technical Depth & Interview Defensibility:* Candidates must be prepared to defend the exact design choices of their projects (e.g., "Why MongoDB over Redis/Valkey? What are the trade-offs of in-memory databases?", "What is TCP/IP socket programming?", "How do REST APIs work?"). Ensure the CV reflects this depth.
*   **Awards & Achievements:**
    *   *Prestige Ordering:* Order awards by prestige and relevance (e.g., placing highly selective exams/scholarships like KVPY, CMI, or Olympiads strategically relative to JEE).
    *   *Clarity:* Flag vague awards (e.g., "Academic Excellence Award" or "Character Award") that lack the issuing organization, participant pool size, or selection criteria.
    *   *Space Optimization:* Shift minor or contest-specific achievements to a dedicated "Competition/Conference" section if the Awards section becomes too cluttered or to fill empty space at the bottom of the page.
    *   *Elaboration:* Increase the length of award bullets to fit the 90%+ line-completion rule. Expand acronyms (e.g., write "Joint Entrance Examination" instead of "JEE") and bold key ranks/percentiles.
*   **Coursework Categorization:**
    *   Group coursework logically into bolded categories (e.g., **Computer Science**, **Mathematics**, **Electrical**). Do not dump them into a single unformatted line.
    *   Filter out non-relevant/core branch courses (e.g., heavy electrical, chemical, or physics courses) for SDE roles to save space for CS-relevant content.
    *   Use complete, official course names (e.g., "Programming and Data Structures" instead of abbreviations like "PDS" or informal names like "Programming with C++").
    *   Highlight CS coursework even if self-taught (using an asterisk or note).
    *   Mark lab components with an asterisk `*` and add a small footnote at the bottom (e.g., `*Includes laboratory component` or `*Includes Theory and Lab`) instead of writing "(Theory and Lab)" repeatedly.
    *   Move MOOCs to a separate line or ensure distinct spacing to avoid cluttering core academic coursework.
    *   Remove informal or non-prestigious training platforms (e.g., "Apna College", "Udemy") from core coursework or education sections; keep the profile strictly professional.
*   **Positions of Responsibility (POR):**
    *   Limit PORs to a maximum of 2 for SDE roles to save space for technical content.
    *   Ensure every POR entry has at least 2 high-impact bullet points; single-bullet entries look incomplete. If the CV has empty space at the bottom, expand the POR descriptions to fill the page.
    *   Place the highest-impact POR (e.g., leadership roles like "Secretary" or "Subhead" in technical societies) at the top of the section.
    *   Exclude or demote non-technical PORs (e.g., cultural, sports, or sponsorship roles) to the ECA section when applying for core technical roles. Keep the POR section strictly focused on technical leadership (e.g., Software Clubs, Open Source Societies).
    *   *Formatting:* Remove trailing hyphens or weird characters in titles. Ensure clean spacing around separators (e.g., space around `|`). Elaborate on organization names (e.g., "Patel Hall of Residence, IIT Kharagpur" instead of just "Patel Hall").
*   **Extra-Curricular Activities (ECA):**
    *   Keep the ECA section extremely brief (ideally 1-line bullets, maximum 2-3 points total) to save space for technical sections.
    *   Prioritize technical or highly structured extra-curricular activities (e.g., coding clubs, technical societies) at the top of the ECA section, followed by sports and cultural activities.
    *   Focus on active roles, leadership, or concrete achievements (e.g., sports captaincy, camp experiences) rather than passive participation or grades (e.g., "Ex grade").
    *   Avoid unprovable hobbies (e.g., "History & Geopolitics") that lack concrete achievements or institutional backing.
    *   *Formatting:* Keep a clean space between the category (e.g., "Sports:") and the bullet text. Bold key competition names or achievements (e.g., **Yoga**, **Skit**, **Athletics**). Mention specific contributions (e.g., scripting, direction, team performance).
    *   *Clarity:* Be specific and clear about contributions (e.g., "Dance: Learnt basic Kathak under National Cultural Appreciation (NCA)..." instead of just "Part of NCA").

---

#### 4. Agent Output Strategy
When the agent generates the review, it should structure its feedback in these distinct buckets:

1.  **Tech Stack Audit:** Identifies skills that are claimed but not proven in the bullet points. Flags basic skills (like HTML/CSS) or redundant listings (like MongoDB/Mongoose) that should be removed or replaced with modern frameworks. Ensures no conceptual terms (like OOP, OOPS, or STL) or hardware-specific tools (like LTspice or Vivado) are listed as core software technologies. Flags and removes generic design tools like Canva or Figma.
2.  **Impact & Stat Rewrites:** Automatically rewrites generic backend/frontend tasks into quantifiable achievements using the XYZ formula, ensuring no repetitive action verbs are used, meta-language (like "Objective:", "Overview:", or "Project Description:") is eliminated, and specific metrics/stats are integrated.
3.  **Code/Repo Defensibility:** Highlights complex architectural claims (e.g., multi-threading, custom compilers, ZK-proofs, custom socket programming, 2PL protocols) and appends the warning: *"Expect to be whiteboarded on this exact system design and its trade-offs (e.g., why MongoDB over Redis, how TCP sockets handle packet loss) in an interview—ensure you can defend it."* Flags and removes raw repository URLs.
4.  **Rank & Handle Extraction:** Pulls out global hackathon ranks, competitive coding ratings, and handles, formatting them into the standardized `Platform: handle (Rating, Rank)` structure, ensuring handles are present for all platforms, rank tiers are bolded, and combined platform achievements are split into separate bullets.
5.  **Layout & White Space Analysis:** Identifies lines that end prematurely (violating the 90%+ line-completion rule or the single-line bullet rule for projects), uneven section spacing, non-uniform character sizes, trailing empty lines, and unaligned dates, providing specific rephrasing suggestions to achieve "Zero White Space." Ensures proper spacing around bullets, section dividers, and pipe separators. Ensures JEE candidate pool sizes are standardized (e.g., "250K+" instead of "2.5 Lakh"). Ensures projects have a duration of at least 2 months and PORs have at least 2 bullets. Flags and corrects intra-word spacing errors (e.g., `Node. js` -> `Node.js`). Ensure dates are strictly right-aligned and enclosed in square brackets.