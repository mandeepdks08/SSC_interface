const form = document.querySelector("form");
function validate() {
    //phone validation
    const phone = form.elements.phone.value.toString();
    if(phone.length != 10) {
      document.querySelector('#error').innerText = "Enter a 10 digit phone no.!";
      return false;  
    }
  
    //password validation
    const password = form.elements.password.value.toString();
    if(password.length < 8) {
      document.querySelector('#error').innerText = "Password should contain at least 8 characters!";
      return false;   
    }
  
    //pin validation
    const pin = form.elements.pin.value.toString();
    if(pin.length != 6) {
      document.querySelector('#error').innerText = "Pin should be of 6 digits!";
      return false;
    }
    return true;
  }

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if(validate()) {
      form.submit();
    }
})


