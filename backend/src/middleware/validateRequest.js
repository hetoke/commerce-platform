// middleware/validateRequest.js
import { validationResult } from "express-validator";

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Return the first error message
    return res.status(400).json({ 
      message: errors.array()[0].msg 
    });
  }
  
  next();
};