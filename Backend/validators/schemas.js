import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Name is required.',
    'string.min': 'Name must be at least 2 characters.',
    'string.max': 'Name must not exceed 100 characters.'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email.',
    'string.empty': 'Email is required.'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters.',
    'string.empty': 'Password is required.'
  })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email.',
    'string.empty': 'Email is required.'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required.'
  })
});

export const bookSchema = Joi.object({
  name: Joi.string().min(1).max(200).required().messages({
    'string.empty': 'Book name is required.',
    'string.max': 'Book name must not exceed 200 characters.'
  }),
  category: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Category is required.',
    'string.max': 'Category must not exceed 100 characters.'
  }),
  rentPerDay: Joi.number().positive().required().messages({
    'number.positive': 'Rent per day must be a positive number.',
    'any.required': 'Rent per day is required.'
  })
});

export const transactionSchema = Joi.object({
  bookId: Joi.string().required().messages({
    'string.empty': 'Book ID is required.'
  }),
  userId: Joi.string().required().messages({
    'string.empty': 'User ID is required.'
  }),
  issueDate: Joi.date().iso().required().messages({
    'date.base': 'Issue date must be a valid date.',
    'any.required': 'Issue date is required.'
  }),
  returnDate: Joi.date().iso().optional()
});

export const issueBookSchema = Joi.object({
  bookName: Joi.string().required().messages({
    'string.empty': 'Book name is required.'
  }),
  userName: Joi.string().required().messages({
    'string.empty': 'User name is required.'
  }),
  issueDate: Joi.date().iso().required().messages({
    'date.base': 'Issue date must be a valid date.',
    'any.required': 'Issue date is required.'
  })
});

export const returnBookSchema = Joi.object({
  bookName: Joi.string().required().messages({
    'string.empty': 'Book name is required.'
  }),
  userName: Joi.string().required().messages({
    'string.empty': 'User name is required.'
  }),
  returnDate: Joi.date().iso().required().messages({
    'date.base': 'Return date must be a valid date.',
    'any.required': 'Return date is required.'
  })
});

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map(detail => detail.message);
      return res.status(422).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    req.validatedBody = value;
    next();
  };
};
