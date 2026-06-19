### 🧠 Data (Science / Analytics / Engineering) CV Evaluation Directives

#### 1. Core Feedback Rules (Baseline & Data-Specific Pitfalls)
Your agent must be programmed to flag the following common pitfalls in Data CVs:

*   **The "Impact vs. Tool" Filter:** Flag bullets that simply list tools or libraries (e.g., "Used Pandas and Scikit-learn for data analysis") without explaining the business or technical impact. Pointers must front-load the impact and follow a format like: *"Solved [Problem] by implementing [Model/Tool], resulting in [Quantifiable Metric]"*.
*   **Data Scale & Pipeline Clarity:** Ensure the CV explicitly mentions the volume or complexity of the data handled (e.g., "10M+ rows," "50K+ mortgages," "terabytes of unstructured data") and the specific ETL/pipeline processes used. Ensure internships and projects include clear numerical results and data scales to provide a quantifiable view of the candidate's contributions.
*   **Contextualizing Data Sources:** Avoid vague descriptions of data sources (e.g., "25 sensor data"). Force the candidate to replace them with highly contextual descriptions (e.g., "Analysed signals from 25 high-frequency industrial temperature sensors to predict...").
*   **Accuracy & Evaluation Metrics:** Flag any machine learning models mentioned without corresponding evaluation metrics (e.g., RMSE, F1-score, accuracy, precision/recall, BLEU, PSNR, SSIM, or ROC-AUC). For generative models, style-transfer projects, or unsupervised learning, check for specific training metrics, epochs, optimizers, loss functions, and stopping criteria.
*   **Quantifiable Value & Hyperparameter Tuning:** Highlight and reward the inclusion of specific metrics showing model improvement (e.g., "improving F1-score from 0.066 to 0.91" or "reducing GPU usage by 60%"). Flag projects that claim optimization without mentioning hyperparameter tuning methods (e.g., GridSearchCV, Bayesian Optimization, Keras-tuner) and the specific techniques used.
*   **Specific Algorithm vs. Library:** Flag instances where a candidate mentions a high-level library or framework (e.g., `AutoTS`, `scikit-learn`, `statsmodels`) without specifying the actual underlying algorithm used (e.g., ARIMA, Random Forest, XGBoost, LSTM).
*   **Avoid Over-Technical Obscurity:** Flag highly academic or obscure statistical jargon (e.g., "absence of unit roots," "heteroscedasticity") if presented without plain-English context or practical business/technical implications. Translate raw mathematical notations (e.g., $R^2 = 0.86$) into plain English explanations where appropriate, or ensure they are fully contextualized.
*   **Action Verb Diversity & Weak Verbs:** Flag the repetitive use of generic action verbs (e.g., starting multiple consecutive bullets with "Built," "Developed," "Created," or "Performed"). Additionally, flag weak, passive, or collaborative phrases that dilute individual ownership (e.g., "Assisted in managing," "Worked with a team of," "Got awarded," "Made it to," "Gained hands-on experience in," "Learned to evaluate"). Force the agent to suggest diverse, high-impact, active alternatives (e.g., "Engineered," "Optimized," "Formulated," "Spearheaded," "Coordinated," "Won," "Qualified," "Co-ordinated & maintained logistics for").
*   **Tangible Examples over Vague Adjectives:** Flag vague descriptors like "insightful charts," "various models," or "market reports." Force the candidate to use tangible examples (e.g., "generated interactive cohort analysis and retention heatmaps" or "developed 5+ forecasting models including SARIMA and LSTM").
*   **The "Cliche Project" Filter:** Flag highly common, tutorial-grade projects (e.g., basic "Sentiment Analysis on IMDB," "Car Price Predictor," "News Classifier," "Fashion MNIST Classifier," or basic "Movie Recommender Systems") unless they highlight highly unique, advanced methodologies, custom architectures, or deployment pipelines. Suggest replacing them with more unique domain-specific projects or significantly elevating their technical depth.
*   **Project Naming & Framing:** Avoid generic or step-based project titles (e.g., "Exploratory Data Analysis on Asteroid Risk Dataset"). Rename them to reflect the actual system, tool, or solution built (e.g., "Asteroid Risk Detector").
*   **Self-Project Verification:** Encourage the inclusion of GitHub repository links for self-projects to verify authenticity and allow reviewers to inspect the codebase.
*   **Technical Accuracy of Terms:** Ensure technical terms and frameworks are used correctly. For example, flag statements claiming "data preprocessing using pickle and json" (pickle and JSON are serialization/storage formats, not preprocessing frameworks).
*   **Front-loading Metrics & Bold Placement:** Do not hide key metrics (like accuracy, F1-score, RMSE) in brackets at the end of a sentence. Instead, front-load them or integrate them directly into the action-impact flow (e.g., "Achieved 95% accuracy by implementing..." instead of "...achieving accuracy (95%)"). Ensure bolded keywords and metrics are positioned near the beginning of the sentence to capture immediate attention.
*   **Bullet Ordering by Impact:** Within any experience or project, ensure the bullet points are ordered by impact. Lead with the most impressive achievements (e.g., budget management, high-impact model deployment, or significant metric improvements) rather than chronological or step-by-step tasks.
*   **Insights and Lessons Learned:** For research-oriented internships or projects, ensure the candidate highlights the specific insights, conclusions, or lessons learned from their analysis rather than just stating that they performed research.
*   **Project Structure Pattern:** Encourage a structured pattern for project bullet points:
    *   *Bullet 1:* Problem statement definition, objective, and dataset scale.
    *   *Bullet 2:* Technical implementation (specific models, frameworks, pipelines, and optimization).
    *   *Bullet 3:* Quantifiable results, evaluation metrics, and business/technical impact.
*   **Equal Bullet Distribution:** Ensure projects and internships have a balanced and consistent number of bullet points (ideally exactly 3-4 points per entry) to maintain visual symmetry and depth.

---

#### 2. Formatting, Layout & CV Hygiene
Your agent must enforce strict structural and aesthetic standards to ensure professional readability:

*   **Section Ordering & Relevance:** 
    *   Ensure a logical hierarchy. Internships must be placed above Projects. Awards and Achievements should be placed below Projects. Coursework should be positioned below Positions of Responsibility (POR).
    *   The ideal flow for a Data CV is: **Education ➔ Internships ➔ Projects ➔ Skills ➔ Awards & Achievements ➔ Certifications ➔ Coursework ➔ Positions of Responsibility (POR) ➔ Extra-Curricular Activities (ECA)**.
    *   If targeting technical roles, place highly relevant sections (like Skills, Internships, and Projects) at the top. Move non-technical or less relevant sections (like non-data Awards or general PORs) below Skills and Projects.
*   **Date Alignment & Consistency:** All dates must be strictly right-aligned to the margin. Date formats must be uniform throughout the CV, using a consistent 3-letter month abbreviation style (e.g., `[Jun'25 - Present]` or `[Dec'24 - Jan'25]`). Avoid spelling out full months (e.g., use "Jul" instead of "July"). Ensure *every* single project, internship, and experience has a date; do not leave any entry dateless. Ensure date intervals are consistently formatted across all sections.
*   **Bullet Point Structure & Line Fill:** 
    *   Each bullet point should ideally fit within exactly 1 line. If a second line is necessary, ensure it does not wrap with just 1-2 trailing words. Split excessively long sentences into multiple distinct bullet points.
    *   Minimize excessive whitespace at the end of lines; bullet points should fill at least 80% to 90% of the line width to maximize page utilization. Reframe sentences to achieve this.
    *   Do not use italics within the body text of bullet points.
    *   Avoid using semicolons (`;`) followed immediately by another action verb within a single bullet point. Instead, use continuous verb forms or split them into separate, cohesive points.
    *   Each bullet point should convey exactly one primary contribution or metric.
*   **Symbol & Punctuation Spacing:** Enforce strict spacing rules:
    *   No full stops (periods) at the end of bullet points (including the final bullet of an experience or awards section).
    *   Single space after bullet symbols.
    *   Spaces *after* commas and colons, but *never* before them.
    *   Spaces before and after hyphens (` - `) and pipe characters (` | `).
    *   No spaces around slashes (`/`).
    *   No spaces after opening brackets or before closing brackets (e.g., use `(text)` instead of `( text )`).
    *   Strictly avoid double or triple spaces within sentences.
*   **Bullet Style Consistency:** Ensure the exact same bullet point symbol (e.g., standard solid circular bullet) is used consistently throughout the entire document. Flag any mixed bullet styles (e.g., using `o` or `•` or square bullets in different sections).
*   **Structural & Heading Consistency:** If an "Objective:" or "Aim:" line is used for one project or internship, it must be used consistently across all entries in that section, or removed entirely. Ensure all section headings are styled uniformly (e.g., avoid cases where some headings are bold and others are normal). Keep internship and project headings short, clean, and informative rather than cluttered with excessive metadata. Ensure that sub-headings (like "Objective:") maintain a completely consistent font size and style across the entire document.
*   **Bolding Strategy & Density:** Bold impactful words, key metrics, and important technical keywords in each sentence. Do not limit bolding only to numerical values. Avoid over-bolding entire phrases; keep bolding highly selective (no more than 2-3 key terms per bullet) to maintain visual hierarchy. Ensure that bolding meaningful achievements (e.g., "**web & mobile**") is prioritized over generic terms (e.g., "**wireframes**").
*   **No Bold Punctuation/Brackets:** Do not bold brackets, parentheses, or punctuation marks surrounding non-bolded text (e.g., use `(**95%**)` instead of `**(**95%**)**` or `(**top 0.5%**)` instead of `**(**top 0.5%**)**`).
*   **Font Size & Uniformity:** Font sizes must be strictly 10 or 11pt. Ensure absolute font size uniformity across all sections, headings, and body text (headings can be 1-2pt larger, but body text must be completely uniform). Bold text must not appear in a larger or different font size than regular text; ensure bolding does not distort or bloat the visual line height.
*   **Capitalization of Technical Terms:** Ensure proper lowercase/uppercase rules. Do not capitalize common nouns mid-sentence (e.g., "dimensionality reduction" should be lowercase, not "Dimensionality Reduction" or "Dimensionality reduction"). Ensure proper capitalization of proficiency levels (e.g., "Proficient" instead of "proficient").
*   **Spaces in Code/Class Names:** Ensure proper spacing in class, model, or algorithm names (e.g., "Random Forest Classifier" instead of "RandomForestClassifier").
*   **Coursework & Certifications Formatting:**
    *   Do not use shorthand notations like "(+Lab)" or "(Theory + Lab)". Write out the full course names (e.g., "Programming and Data Structures Laboratory") to maintain professional standards.
    *   Separate university-credited courses from external MOOCs or certifications. Create a distinct "MOOCs" or "Certifications" section for external platforms (e.g., Coursera, Udemy).
    *   Remove irrelevant coursework (e.g., basic non-data core courses or unrelated labs) to save space for technical content.
*   **Formatting of Awards:** Write awards and achievements as clear, descriptive bullet points (e.g., "Secured second position in [School/Competition] out of [Metric]..."). Bold key ranks, percentages, and numbers.
*   **Soft Skills Section Removal:** Remove "Soft Skills" sections entirely (e.g., "Teamwork | Communication | Time Management"); soft skills should be demonstrated through experience and achievements, not listed as keywords.
*   **ECA vs. POR:** Move leadership, organizational, or club-related experiences (e.g., being an Associate Member of a society, organizing a fest, or E-Cell experience) out of Extra-Curricular Activities (ECA) and into Positions of Responsibility (POR). Ensure POR entries have multiple descriptive bullet points.
*   **ECA Placement:** Position the Extra-Curricular Activities (ECA) section at the very bottom of the CV, below Coursework, as it is the lowest priority for technical data profiles. Encourage adding hobbies or official extracurricular activities (e.g., NSS, NSO, NCC) to fill space if needed.
*   **Whitespace Management:** If there is significant blank space at the bottom of the page, increase content density (e.g., add more university coursework, expand on PORs, or add more technical details to projects) rather than leaving empty vertical space or using excessively large fonts.
*   **No Duplications:** Scan for and flag duplicate project, competition, or experience entries (e.g., copy-paste errors).
*   **Grammar & Phrasing:** Enforce past tense for completed projects and internships. Ensure proper use of articles ("a", "the") and run a strict grammar check.

---

#### 3. Data-Specific Keyword & Content Matching
Your agent should scan for and elevate the following analytical experiences:

*   **Machine Learning / AI Depth & Project Requirement:** Reward bullets that explain *why* a specific model (e.g., Random Forest, XGBoost, LLMs, Neural Networks, GCNs) was chosen and how it was optimized. For data science/ML profiles, ensure the CV contains at least one core Machine Learning project with clear metrics (e.g., RMSE, F1-score) rather than only basic data analyst or visualization projects.
*   **Data Visualization & Storytelling:** Look for tools like Tableau, PowerBI, or Matplotlib, but specifically check if they are tied to how they influenced a business decision or stakeholder action. Flag generic "analyzed trends" statements; the CV must explain *what* the trends were, *how* the conclusion was reached, and the business value derived.
*   **Statistical Rigor:** Highlight evidence of setting up experiments, defining control groups, A/B testing, and measuring statistical significance.
*   **Database & Cloud Proficiency:** Look for mentions of SQL optimization, database management, and cloud platforms (AWS, GCP, Azure) used for deployment.
*   **Tool Filtering:** Flag basic non-data tools (e.g., VS Code, MS PowerPoint, Canva, operating systems like Windows/MacOS/Ubuntu, or IDEs) listed as core "Data" skills. While Excel and Power BI are acceptable, basic office, design, or IDE tools should be excluded from the technical skills section.
*   **Skills Section Naming:** Rename generic headers like "Course Skills" or "Languages/Libraries" to "Core Skills," "Technical Skills," or "Skills and Expertise."
*   **Terminology & Naming:** Use full professional terms instead of abbreviations in headers (e.g., "Natural Language Processing" instead of "NLP (Machine Learning)"). Ensure proper capitalization of technologies (e.g., "GitHub" instead of "Github", "PyTorch" instead of "Pytorch", "NumPy" instead of "Numpy", "TensorFlow" instead of "Tensorflow").
*   **Tool Usage Context:** Ensure listed tools in the skills section reflect actual usage in the projects or internships. Flag tools listed in the skills section that do not appear anywhere in the experience descriptions.
*   **Project Branding:** If a project is based on a tutorial or YouTube channel (e.g., CampusX), it should be listed as a "Self-Project" rather than using the channel's brand name.
*   **Competition Context:** If a competition is mentioned (e.g., Kaggle, Hackathons), the CV must provide the context of the Problem Statement (PS) and the candidate's specific approach.
*   **Individuality over Organization:** Focus on individual contributions. Minimize descriptions of the organization, society, or competition itself; keep the focus strictly on what the candidate designed, built, or achieved.

---

#### 4. Agent Output Strategy
When the agent generates the review, it should structure its feedback in these distinct buckets:

1.  **Format & Structure:** Flags missing headers, inconsistent bolding, layout imbalances, date alignment issues, shorthand course names, trailing punctuation inconsistencies, incorrect section ordering, spacing errors around symbols, font size discrepancies, and unspaced class names.
2.  **Impact Rewrites:** Takes generic "I analyzed data" or repetitive "Built/Developed" bullets and rewrites them to front-load the business impact, specify findings, integrate specific metrics, eliminate passive phrasing, and ensure proper bolding placement.
3.  **Technical Gaps:** Identifies missing dataset sizes, missing model evaluation metrics (especially for generative/unsupervised models), missing stopping criteria, filters out non-data tools from the skills section, flags cliche projects, incorrect technical terminology, and ensures the presence of core ML projects.