const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Vehicle validation rules
const validateVehicle = [
  body('reg_number')
    .notEmpty()
    .withMessage('Registration number is required')
    .isLength({ max: 20 })
    .withMessage('Registration number must be less than 20 characters'),
  
  body('manufacturer')
    .notEmpty()
    .withMessage('Manufacturer is required')
    .isLength({ max: 50 })
    .withMessage('Manufacturer must be less than 50 characters'),
  
  body('model')
    .notEmpty()
    .withMessage('Model is required')
    .isLength({ max: 50 })
    .withMessage('Model must be less than 50 characters'),
  
  body('vehicle_type')
    .notEmpty()
    .withMessage('Vehicle type is required')
    .isIn(['sedan', 'suv', 'truck', 'hatchback', 'coupe', 'motorcycle'])
    .withMessage('Invalid vehicle type'),
  
  body('chassis_number')
    .notEmpty()
    .withMessage('Chassis number is required')
    .isLength({ max: 50 })
    .withMessage('Chassis number must be less than 50 characters'),
  
  body('year_of_manufacture')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Invalid year of manufacture'),
  
  body('vin')
    .notEmpty()
    .withMessage('VIN is required')
    .isLength({ min: 17, max: 17 })
    .withMessage('VIN must be exactly 17 characters'),
  
  body('license_plate')
    .notEmpty()
    .withMessage('License plate is required')
    .isLength({ max: 20 })
    .withMessage('License plate must be less than 20 characters'),
  
  body('owner_name')
    .notEmpty()
    .withMessage('Owner name is required')
    .isLength({ max: 100 })
    .withMessage('Owner name must be less than 100 characters'),
  
  body('owner_email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('owner_phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Invalid phone number format'),
  
  handleValidationErrors
];

// Fine validation rules
const validateFine = [
  body('fine_id')
    .notEmpty()
    .withMessage('Fine ID is required')
    .isLength({ max: 20 })
    .withMessage('Fine ID must be less than 20 characters'),
  
  body('vehicle_id')
    .isInt({ min: 1 })
    .withMessage('Valid vehicle ID is required'),
  
  body('offense_description')
    .notEmpty()
    .withMessage('Offense description is required')
    .isLength({ max: 500 })
    .withMessage('Offense description must be less than 500 characters'),
  
  body('offense_date')
    .isISO8601()
    .withMessage('Valid offense date is required'),
  
  body('offense_location')
    .notEmpty()
    .withMessage('Offense location is required')
    .isLength({ max: 200 })
    .withMessage('Offense location must be less than 200 characters'),
  
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Valid amount is required'),
  
  body('payment_status')
    .optional()
    .isIn(['paid', 'unpaid', 'overdue'])
    .withMessage('Invalid payment status'),
  
  handleValidationErrors
];

// User validation rules
const validateUser = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('full_name')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ max: 100 })
    .withMessage('Full name must be less than 100 characters'),
  
  handleValidationErrors
];

// Login validation rules
const validateLogin = [
  body('username')
    .notEmpty()
    .withMessage('Username is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// ID parameter validation
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid ID is required'),
  
  handleValidationErrors
];

// Query parameter validation
const validateQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search term must be less than 100 characters'),
  
  handleValidationErrors
];

module.exports = {
  validateVehicle,
  validateFine,
  validateUser,
  validateLogin,
  validateId,
  validateQuery,
  handleValidationErrors
};