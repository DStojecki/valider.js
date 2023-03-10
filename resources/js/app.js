import  Validators  from "./validators"
import settings from '../../settings.json'

export default class Valider {
    constructor(config) {
        this._valid = true
        this._validationAttrsList = settings.settings
        this.config = config
        this.inputs = [...document.querySelectorAll(config.selector)]
        this.addValidClass = config.addValidClass
        this.validators = new Validators

        if(config.validateOn == '') return

        this.validateOnEvent(config.validateOn)
        this.setListeners()
    }

    send() {
        let respond = ''

        if(!this.check()) {
            console.log('Validation error')
        }else {
            respond = this.request()
        }

        return respond
    }

    buildRequestBody() {
        let body = {}

        this.inputs.forEach(input => {
            let key = input.getAttribute('name')

            if(key === null) key = 'Name attr missing'

            body[key] = input.value
        })

        return body
    }

    async request() {
        const url = this.config.request.route
        const body = this.buildRequestBody()
    
        console.log(body);
        try {
            const response = await fetch(url, {
                method: this.config.request.method,
                body: JSON.stringify(body)
            })

            const data = await response.json()

            return data
        } 
        catch (error) {
            return error
        }
    }

    setListeners() {
        this.inputs.forEach(input => {
            const placeholderAttr = input.getAttribute('data-placeholder')

            if(!placeholderAttr) return

            input.addEventListener('mouseover',() => {
                input.placeholder = placeholderAttr
            })

            input.addEventListener('mouseout',() => {
                input.placeholder = ''
            })
        })

    }
    
    validateOnEvent(settingsEvent) {
        this.inputs.forEach(input => {
            const particularEvent = input.getAttribute('data-event')
            const event = particularEvent == undefined ? settingsEvent : particularEvent 

            input.addEventListener(event, () =>{
                this.triggerValidators(input)
            })
        })
    }

    check() {
        this._valid = true

        this.inputs.forEach(input => {
            this.triggerValidators(input)
        })

        return this._valid
    }

    triggerValidators(input) {
        const attrs = input.getAttributeNames()
        let validators = []

        this._validationAttrsList.forEach((attr) => {
            // GURAD if attribute is not related with library
            if(!attrs.includes(attr.html)) return
                
            validators.push(attr)
        })

        validators = this.sortValidators(validators)       

        for(let i = 0; i < validators.length; i++) {
            const parametr = input.getAttribute(validators[i].html)

            const settings = {
                object: validators[i],
                input: input,
                addValid: this.addValidClass,
                parametr: parametr,
            }

            const result = this.validators.validate(settings)

            result ? '' : this._valid = result

            if(!result) break
        }
    }

    sortValidators(validators)  {
        const index = validators.findIndex(el => el.name == 'required')
        // GURAD if no required found
        if(index == -1) return validators

        const element = validators.splice(index, 1)[0]

        validators.splice(0,0,element)
        
        return validators
    }
}
