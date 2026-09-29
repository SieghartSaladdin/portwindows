import { createCrudHandlers } from './crud';
import { certificationRepo, educationRepo, experienceRepo, projectRepo, skillRepo } from './repos';

export const projectHandlers = createCrudHandlers(projectRepo);
export const skillHandlers = createCrudHandlers(skillRepo);
export const experienceHandlers = createCrudHandlers(experienceRepo);
export const educationHandlers = createCrudHandlers(educationRepo);
export const certificationHandlers = createCrudHandlers(certificationRepo);
