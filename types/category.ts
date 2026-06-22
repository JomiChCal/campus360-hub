export type WizardStudentType = 'continuo' | 'nuevo';

export type WizardCategory = {
  id: string;
  title: string;
  description?: string;
  iconLabel: string;
  studentType: WizardStudentType;
};

export type CategoriesApiResponse = {
  categories: WizardCategory[];
};
