/**
 * Skill Nodes - Displays skill labels alongside the DNA strand
 * Labels are positioned at fixed screen positions, fading in/out with scroll
 */

const SkillNodes = (() => {
    // Calculate dynamic experience duration from a start date
    function calcExperience(startDate) {
        const start = new Date(startDate);
        const now = new Date();
        let years = now.getFullYear() - start.getFullYear();
        let months = now.getMonth() - start.getMonth();
        if (months < 0) { years--; months += 12; }
        if (years >= 1) {
            return months > 0 ? `${years} yr ${months} mo` : `${years} yr`;
        }
        return `${months} mo`;
    }

    const SKILLS = [
        { name: 'Claude', category: 'AI Tool', startDate: '2025-10-01', context: 'AI-powered coding assistant for automation framework development, test generation, and engineering productivity', related: 'Cursor, AI, Prompt Engineering, Claude Code' },
        { name: 'Cursor', category: 'AI Tool', startDate: '2025-10-01', context: 'AI-powered IDE for rapid code generation, refactoring, and intelligent pair programming', related: 'Claude, VS Code, AI, Copilot' },
        { name: 'Java', category: 'Language', startDate: '2021-09-01', context: 'Core language for building scalable automation frameworks across multiple organizations', related: 'Maven, IntelliJ, RestAssured' },
        { name: 'Python', category: 'Language', startDate: '2022-05-01', context: 'Performance testing with Locust, Django-based monitoring suites', related: 'Locust, Django, Scripting' },
        { name: 'Selenium', category: 'Framework', startDate: '2021-09-01', context: 'UI automation with BDD/Cucumber for healthcare and fintech applications', related: 'Cucumber, BDD, WebDriver' },
        { name: 'RestAssured', category: 'Framework', startDate: '2021-09-01', context: 'Backend API automation across all roles — primary tool for service testing', related: 'Java, API Testing, Postman' },
        { name: 'Docker', category: 'DevOps', startDate: '2022-05-01', context: 'Containerized test environments and CI pipelines', related: 'Jenkins, AWS ECS, Microservices' },
        { name: 'Jenkins', category: 'DevOps', startDate: '2022-01-01', context: 'CI/CD pipeline management, scheduled automation runs', related: 'Docker, Git, CI/CD' },
        { name: 'AWS ECS', category: 'Cloud', startDate: '2023-05-01', context: 'Deploying test services and mock servers on cloud infrastructure', related: 'Docker, Cloud, Infrastructure' },
        { name: 'Databases', category: 'Data', startDate: '2021-09-01', context: 'Data validation, test data setup, query-based assertions across relational and NoSQL stores', related: 'PostgreSQL, SQL, InfluxDB, DynamoDB', isGroup: true, items: ['PostgreSQL', 'SQL', 'InfluxDB', 'DynamoDB'] },
        { name: 'Locust', category: 'Performance', startDate: '2023-05-01', context: 'Load testing for feature releases and third-party integrations', related: 'JMeter, Python, Performance' },
        { name: 'JMeter', category: 'Performance', startDate: '2022-01-01', context: 'Load and stress testing across multiple organizations', related: 'Locust, Performance, CI/CD' },
        { name: 'Git', category: 'DevOps', startDate: '2021-09-01', context: 'Version control, branch strategies, code review workflows', related: 'GitHub, Jenkins, CI/CD' },
        { name: 'Cucumber', category: 'Framework', startDate: '2021-09-01', context: 'BDD test authoring, living documentation for test scenarios', related: 'Selenium, BDD, Gherkin' },
        { name: 'Build & Dependency', category: 'Tooling', startDate: '2021-09-01', context: 'Project build lifecycle management, dependency resolution, and artifact packaging', related: 'Java, CI/CD, Jenkins', isGroup: true, items: ['Maven', 'Gradle'] },
        { name: 'Linux', category: 'Infrastructure', startDate: '2021-09-01', context: 'Server management, debugging, log analysis, shell scripting', related: 'Bash, SSH, DevOps' },
        { name: 'n8n', category: 'Automation', startDate: '2025-06-01', context: 'Built Slack-based regression orchestration bot for team productivity', related: 'Slack, Workflows, Bots' },
        { name: 'Postman', category: 'Testing', startDate: '2021-09-01', context: 'Manual API exploration, collection management, team collaboration', related: 'RestAssured, API, Swagger' },
        { name: 'C++', category: 'Language', startDate: '2018-07-01', context: 'Academic and competitive programming foundation', related: 'DSA, Problem Solving' },
    ];

    let labelElements = [];
    let container = null;

    function init() {
        container = document.getElementById('skills-container');
        createLabels();
    }

    function createLabels() {
        SKILLS.forEach((skill, index) => {
            const side = index % 2 === 0 ? 'left' : 'right';

            const label = document.createElement('div');
            label.className = `skill-label ${side}`;
            label.dataset.index = index;

            if (skill.isGroup) {
                // Group label with heading + items
                const heading = document.createElement('span');
                heading.className = 'skill-group-heading';
                heading.textContent = skill.name;
                label.appendChild(heading);

                const items = document.createElement('span');
                items.className = 'skill-group-items';
                items.textContent = skill.items.join(' · ');
                label.appendChild(items);
            } else {
                label.textContent = skill.name;
            }

            if (side === 'left') {
                label.style.left = '5%';
            } else {
                label.style.right = '5%';
                label.style.left = 'auto';
            }

            label.addEventListener('click', () => onSkillClick(index));
            container.appendChild(label);
            labelElements.push(label);
        });
    }

    // Pre-compute constants
    const totalSkills = SKILLS.length;
    const windowPerSkill = 1 / totalSkills;
    const visibleWindow = 3;
    const maxDist = visibleWindow * windowPerSkill;

    function updateVisibility(scrollProgress) {
        for (let index = 0; index < totalSkills; index++) {
            const label = labelElements[index];
            const skillCenter = (index + 0.5) / totalSkills;
            const dist = Math.abs(scrollProgress - skillCenter);

            if (dist < maxDist) {
                const relativePos = (scrollProgress - skillCenter) / maxDist;
                label.style.top = `${50 + relativePos * -40}%`;
                label.style.transform = 'translateY(-50%)';
                label.style.opacity = Math.pow(1 - dist / maxDist, 0.8);
                label.classList.add('visible');
            } else if (label.classList.contains('visible')) {
                label.style.opacity = '0';
                label.classList.remove('visible');
            }
        }
    }

    function onSkillClick(index) {
        const skill = SKILLS[index];
        const side = index % 2 === 0 ? 'left' : 'right';
        // Pass skill with dynamically computed experience
        const skillWithExp = {
            ...skill,
            experience: calcExperience(skill.startDate)
        };
        ARFrame.show(skillWithExp, side);
    }

    function getSkills() {
        return SKILLS;
    }

    return { init, updateVisibility, getSkills };
})();
