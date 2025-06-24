export interface WorkExperience {
  company: string;
  companyUrl: string;
  logoUrl: string;
  title: string;
  period: string;
  current: boolean;
  role: string;
  description: string;
  details: string[];
  skills: string[];
}

export const WORK_EXPERIENCES: WorkExperience[] = [
  {
    company: 'Rivercrane Viet Nam',
    companyUrl: 'https://rivercrane.vn/',
    logoUrl: 'https://d9akteslg4v3w.cloudfront.net/blog/images/rivercrane_vietnam_logo.jpeg',
    title: 'Full Stack Web Developer',
    period: 'March 2025 – Present',
    current: true,
    role: 'Full Stack Web Developer',
    description:
      'Working on a e-commerce platform for Webike at Europe',
    details: [
      'Developing core features, improving user experience, and fixing bugs',
      'Enhancing the platform with new features and improving the codebase',
    ],
    skills: [
      'Laravel',
      'MySQL',
      'Redis',
      'Microservices',
      'Jenkins',
      'Docker Swarm',
    ],
  },
  {
    company: 'Green Space Solution',
    companyUrl: 'https://www.gss-sol.com/',
    logoUrl: 'https://d9akteslg4v3w.cloudfront.net/blog/images/gss.svg',
    title: 'Web Developer',
    period: 'March 2023 – November 2024',
    current: false,
    role: 'Web Developer',
    description:
      'Worked on multiple projects including a Web3 webhook microservice, a Real estate valuation platform, and an Automated TMS System, contributing to backend, frontend, and cloud infrastructure.',
    details: [
      'Developed a scalable Web3 webhook microservice with NestJS, Redis (BullMQ), PostgreSQL, and AWS, reducing event processing latency.',
      'Automated cloud infrastructure deployment using AWS CDK (TypeScript) and GitHub Actions, ensuring scalable and secure ECS (Fargate) environments.',
      'Built user management and property valuation APIs with AWS Lambda, DynamoDB, and API Gateway for a real estate platform.',
      'Enhanced TMS application with NextJS, Strapi, MySQL, GraphQL, and advanced state management using Redux Toolkit.',
    ],
    skills: [
      'NestJS',
      'PostgreSQL',
      'AWS',
      'TypeScript',
      'ECS',
      'GitHub Actions',
      'VueJS',
      'Lambda',
      'DynamoDB',
      'API Gateway',
      'Laravel',
      'MySQL',
      'NextJS',
      'GraphQL',
    ],
  },
  {
    company: 'Military Service',
    companyUrl: 'https://www.mod.gov.vn/',
    logoUrl:
      "https://d9akteslg4v3w.cloudfront.net/blog/images/Head_badge_of_the_Vietnam_People's_Army.svg", // A generic, professional icon
    title: 'Communications Soldier',
    period: 'March 2021 - February 2023',
    current: false,
    role: 'Infantry Soldier / Communications Soldier',
    description:
      'Served in the national armed forces, developing discipline, teamwork, and problem-solving skills in high-pressure environments.',
    details: [
      'Completed rigorous physical, tactical, and strategic training.',
      'Operated and maintained standard-issue equipment and technology.',
      'Collaborated effectively within a diverse team to achieve mission objectives.',
      'Demonstrated leadership, strong work ethic, and adaptability under pressure.',
    ],
    skills: [
      'Leadership',
      'Teamwork',
      'Discipline',
      'Problem-Solving',
      'Adaptability',
    ],
  },
  {
    company: 'Innoria Solutions',
    companyUrl: 'https://innoria.com/',
    logoUrl: 'https://d9akteslg4v3w.cloudfront.net/blog/images/INNORIA.svg',
    title: 'Software Engineer Intern',
    period: 'December 2019 - February 2021',
    current: false,
    role: 'Intern - Junior Web Developer',
    description: 'Insilos platform for ISO 45001 management system',
    details: [
      'Developed Training and Equipment modules using Angular and ParseJS',
      'Build a scalable and high-performance system using NodeJS, MongoDB, and Docker',
    ],
    skills: ['NodeJS', 'Angular', 'MongoDB', 'Docker', 'ParseJS'],
  },
];
