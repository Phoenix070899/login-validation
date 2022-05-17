function Validator(options) {

    function validate(inputElement, rule) {
        var errElement = inputElement.parentElement.querySelector(options.errorSelector)
        var errMess = rule.test(inputElement.value)
        //Lấy ra các rule của selector
        var rules = selectorRules[rule.selector]
        //Lặp qua từng rule của selector
        for (let i = 0; i < rules.length; i++) {
            errMess = rules[i](inputElement.value)
            //Nếu có lỗi thì thoát khỏi loop và báo lỗi
            if (errMess) break
        }
        if (errMess) {
            errElement.innerText = errMess
            errElement.style.color = 'red'
        } else {
            errElement.innerText = ''
        }
        //Hàm validate trả ra True khi có lỗi và False khi không có
        return !!errMess
    }

    var selectorRules = {}



    var formElement = document.querySelector(options.form)
    if (formElement) {
        formElement.onsubmit = (e) => {
            e.preventDefault()
            let isFormValid = true;
            //Lặp qua từng rule và validate
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector)
                let isValid = validate(inputElement, rule)
                if (isValid) {
                    isFormValid = false
                }
            }     
        )
        if (isFormValid) {
            //Submit bằng Javascript
            if (typeof options.onSubmit === 'function') {
                var enableInput = formElement.querySelectorAll('[name]:not([disabled])')
                var formValue = Array.from(enableInput).reduce(function (value,input) {
                    return (value[input.name] = input.value) && value
                }, {})
                options.onSubmit(formValue)
            } //Submit bằng hành vi mặc định
            else {
                formElement.submit()
            }
        }
    }
        options.rules.forEach(function (rule) {
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }
            var inputElement = formElement.querySelector(rule.selector)
            if (inputElement) {
                inputElement.onblur = function () {
                    validate(inputElement, rule)
                }
                inputElement.oninput = function () {
                    var errElement = inputElement.parentElement.querySelector(options.errorSelector)
                    errElement.innerText = ''
                }
            }
        })
       
    }

}


Validator.isRequired = function (selector) {
    return {
        selector: selector,
        test(value) {
            return value.trim() ? undefined : "Please fill in your information"
        }
    }
}

Validator.isEmail = function (selector) {
    return {
        selector: selector,
        test(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : "Please fill in your Email address"
        }
    }
}

Validator.isLength = function (selector, length) {
    return {
        selector: selector,
        test(value) {
            return value.length >= length ? undefined : "Your password must have 6 characters or more"
        }
    }
}

Validator.isConfirmed = function (selector, getConfirmValue) {
    return {
        selector: selector,
        test(value) {
            return value === getConfirmValue() ? undefined : "Your password is not correct"
        }
    }
}