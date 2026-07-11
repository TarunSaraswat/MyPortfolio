/**
 * Skill Nodes - Displays skill labels alongside the DNA strand
 * Labels are positioned at fixed screen positions, fading in/out with scroll
 */

const SkillNodes = (() => {
    const SKILLS = [
        { name: 'Java', category: 'Language', experience: '5+ years', context: 'Core language for automation frameworks at Swiggy, CRED, and Innovaccer', related: 'Maven, IntelliJ, RestAssured' },
        { name: 'Python', category: 'Language', experience: '4+ years', context: 'Performance testing with Locust, Django-based monitoring suites', related: 'Locust, Django, Scripting' },
        { name: 'Selenium', category: 'Framework', experience: '4+ years', context: 'UI automation with BDD/Cucumber for healthcare and fintech apps', related: 'Cucumber, BDD, WebDriver' },
        { name: 'RestAssured', category: 'Framework', experience: '5+ years', context: 'Backend API automation across all roles — primary tool for service testing', related: 'Java, API Testing, Postman' },
        { name: 'Docker', category: 'DevOps', experience: '4+ years', context: 'Containerized test environments and CI pipelines', related: 'Jenkins, AWS ECS, Microservices' },
        { name: 'Jenkins', category: 'DevOps', experience: '4+ years', context: 'CI/CD pipeline management, scheduled automation runs', related: 'Docker, Git, CI/CD' },
        { name: 'AWS ECS', category: 'Cloud', experience: '3+ years', context: 'Deploying test services and mock servers on AWS infrastructure', related: 'Docker, Cloud, Infrastructure' },
        { name: 'PostgreSQL', category: 'Database', experience: '4+ years', context: 'Data validation, test data setup, query-based assertions', related: 'SQL, Oracle, DynamoDB' },
        { name: 'Locust', category: 'Performance', experience: '3+ years', context: 'Load testing for feature releases and third-party integrations at Swiggy & CRED', related: 'JMeter, Python, Performance' },
        { name: 'JMeter', category: 'Performance', experience: '4+ years', context: 'Load and stress testing across all organizations', related: 'Locust, Performance, CI/CD' },
        { name: 'Git', category: 'DevOps', experience: '5+ years', context: 'Version control, branch strategies, code review workflows', related: 'GitHub, Jenkins, CI/CD' },
        { name: 'Cucumber', category: 'Framework', experience: '4+ years', context: 'BDD test authoring, living documentation for test scenarios', related: 'Selenium, BDD, Gherkin' },
        { name: 'DynamoDB', category: 'Database', experience: '2+ years', context: 'NoSQL data validation for Swiggy microservices', related: 'AWS, NoSQL, Serverless' },
        { name: 'SQL', category: 'Language', experience: '5+ years', context: 'Complex queries for data integrity validation across all roles', related: 'PostgreSQL, Oracle, Data' },
        { name: 'Linux', category: 'Infrastructure', experience: '5+ years', context: 'Server management, debugging, log analysis, shell scripting', related: 'Bash, SSH, DevOps' },
        { name: 'n8n', category: 'Automation', experience: '1+ year', context: 'Built Slack-based regression orchestration bot at Swiggy', related: 'Slack, Workflows, Bots' },
        { name: 'Postman', category: 'Testing', experience: '5+ years', context: 'Manual API exploration, collection management, team collaboration', related: 'RestAssured, API, Swagger' },
        { name: 'C++', category: 'Language', experience: '3+ years', context: 'Academic and competitive programming foundation', related: 'DSA, Problem Solving' },
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
            label.textContent = skill.name;
            label.dataset.index = index;

            // Fixed horizontal position: left side or right side of center
            if (side === 'left') {
                label.style.left = '8%';
            } else {
                label.style.right = '8%';
                label.style.left = 'auto';
            }

            label.addEventListener('click', () => onSkillClick(index));
            container.appendChild(label);
            labelElements.push(label);
        });
    }

    function updateVisibility(scrollProgress) {
        const totalSkills = SKILLS.length;
        // Each skill occupies a window of scroll progress
        const windowPerSkill = 1 / totalSkills;
        const visibleWindow = 3; // How many skills visible at once

        SKILLS.forEach((skill, index) => {
            const label = labelElements[index];
            const skillCenter = (index + 0.5) / totalSkills;
            const dist = Math.abs(scrollProgress - skillCenter);
            const maxDist = (visibleWindow * windowPerSkill);

            if (dist < maxDist) {
                // Calculate vertical position: map skill's relative position to viewport
                const relativePos = (scrollProgress - skillCenter) / maxDist; // -1 to 1
                const yPos = 50 + relativePos * -40; // Center at 50%, move up as scroll passes

                label.style.top = `${yPos}%`;
                label.style.transform = 'translateY(-50%)';

                // Opacity: strongest at center, fades at edges
                const opacity = 1 - (dist / maxDist);
                label.style.opacity = `${Math.pow(opacity, 0.8)}`;
                label.classList.add('visible');
            } else {
                label.style.opacity = '0';
                label.classList.remove('visible');
            }
        });
    }

    function onSkillClick(index) {
        const skill = SKILLS[index];
        const side = index % 2 === 0 ? 'left' : 'right';
        ARFrame.show(skill, side);
    }

    function getSkills() {
        return SKILLS;
    }

    return { init, updateVisibility, getSkills };
})();
