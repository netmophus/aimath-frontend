const formatPhoneDisplay = (phone) => {
    const digits = phone.replace(/\D/g, "");
    const clean = digits.startsWith("227") ? digits.slice(3) : digits;
    return `+227 ${clean.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4")}`;
  };
  
  module.exports = { formatPhoneDisplay };
  