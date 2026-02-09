import { FormControl } from '@angular/forms';
import { customerNameValidator } from './customer-name.validator';

describe('customerNameValidator', () => {
  const validator = customerNameValidator();

  it('should return null for valid names', () => {
    const validNames = ['john', 'mary-jane', 'user123', 'john-doe-123', 'ABC', 'test-123-abc'];

    validNames.forEach(name => {
      const control = new FormControl(name);
      expect(validator(control)).toBeNull();
    });
  });

  it('should return error for empty value', () => {
    const control = new FormControl('');
    const result = validator(control);
    expect(result).toEqual({ required: true });
  });

  it('should return error for null value', () => {
    const control = new FormControl(null);
    const result = validator(control);
    expect(result).toEqual({ required: true });
  });

  it('should return error for names with spaces', () => {
    const control = new FormControl('john doe');
    const result = validator(control);
    expect(result).toHaveProperty('invalidCustomerName');
    expect(result?.['invalidCustomerName'].message).toBe(
      'Customer name can only contain letters, digits, or hyphens'
    );
  });

  it('should return error for names with special characters', () => {
    const invalidNames = ['john@doe', 'user!', 'name#123', 'test$', 'user_name', 'name.test'];

    invalidNames.forEach(name => {
      const control = new FormControl(name);
      const result = validator(control);
      expect(result).toHaveProperty('invalidCustomerName');
    });
  });
});
