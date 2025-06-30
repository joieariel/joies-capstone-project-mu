// validation logic for register new user in signup.jsx

export const validateNewUser = (formData) => {
  if (
    !formData.firstName ||
    !formData.lastName ||
    !formData.username ||
    !formData.email ||
    !formData.password ||
    !formData.confirmPassword ||
    !formData.status ||
    !formData.birthdate ||
    !formData.zipCode ||
    !formData.city ||
    !formData.state
  ) {
    // remove setError bc it doesn't exist in this file
    // utility functions should return values instead of setting state
    return "Please fill in all fields";
  }

  return null; // no validation errors
};

// validation loigc for edit profile in dashboard.jsx
export const validateEditForm = (editFormData) => {
  if (
    !editFormData.first_name ||
    !editFormData.last_name ||
    !editFormData.username ||
    !editFormData.email ||
    !editFormData.status ||
    !editFormData.birthdate ||
    !editFormData.city ||
    !editFormData.state ||
    !editFormData.zip_code
  ) {
    return "Please fill in all fields";
  }

  return null;
};
