import * as Yup from 'yup';

// Mirrors the Laravel backend (AuthController@register):
//   Password::min(8)->mixedCase()->numbers()->symbols()  + 'confirmed'
//   email must be a valid @up.edu.ph address
//   PH phone number (from the old UserOnboarding1 rule)

export const upEmailRegex = /^[a-zA-Z0-9._%+-]+@up\.edu\.ph$/;
export const phoneRegex = /^(09|\+639)\d{9}$/;

// Single source of truth for the live password checklist + the Yup schema.
export const PASSWORD_RULES = [
    { key: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { key: 'lower', label: 'A lowercase letter', test: (p) => /[a-z]/.test(p) },
    { key: 'upper', label: 'An uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { key: 'number', label: 'At least one number', test: (p) => /[0-9]/.test(p) },
    { key: 'symbol', label: 'At least one symbol', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

// Returns { length, lower, upper, number, symbol } booleans for the checklist UI.
export const passwordChecks = (password = '') =>
    PASSWORD_RULES.reduce((acc, rule) => {
        acc[rule.key] = rule.test(password);
        return acc;
    }, {});

export const isPasswordValid = (password = '') =>
    PASSWORD_RULES.every((rule) => rule.test(password));

// Role -> affiliation options (lifted from the old UserOnboarding2.js).
export const ROLES = ['Student', 'Faculty', 'Employee', 'Other'];

export const ACADEMIC_AFFILIATIONS = [
    'College of Communication, Art, and Design',
    'School of Management',
    'College of Science',
    'College of Social Science',
    'UP High School Cebu',
];

export const EMPLOYEE_AFFILIATIONS = [
    'Office of the Chancellor',
    'OVCAA',
    'OVCA',
    'Office of the University Registrar (OUR)',
    'Office of Student Affairs (OSA)',
    'Campus Maintenance Office (CMO)',
    'others',
];

export const affiliationsForRole = (role = '') =>
    role.toLowerCase() === 'employee' ? EMPLOYEE_AFFILIATIONS : ACADEMIC_AFFILIATIONS;

export const signupSchema = Yup.object().shape({
    email: Yup.string()
        .required('Email is required.')
        .matches(upEmailRegex, 'Please use your official @up.edu.ph email address.'),
    password: Yup.string()
        .required('Password is required.')
        .test('password-rules', 'Password does not meet all requirements.', (value) =>
            isPasswordValid(value || '')
        ),
    confirmPassword: Yup.string()
        .required('Please confirm your password.')
        .oneOf([Yup.ref('password')], 'Passwords do not match.'),
    full_name: Yup.string().trim().required('Full name is required.'),
    phone: Yup.string()
        .required('Phone number is required.')
        .matches(phoneRegex, 'Enter a valid PH number (e.g., 09xxxxxxxxx).'),
    role: Yup.string().required('Please select your role.'),
    department_office: Yup.string().required('Please select your college or office.'),
});
