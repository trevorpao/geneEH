
const utils = {
    closest(element, selector) {
        while (element && element !== document) {
            if (element.matches(selector)) {
                return element;
            }
            element = element.parentNode;
        }
        return null;
    },
    find(element, selector = 'input') {
        element = element || document;
        return Array.from(element.querySelectorAll(selector));
    },
    append(parent, child) {
        parent.appendChild(child);
    },
    serialize(form) {
        const inputs = form.querySelectorAll('input');
        const data = {};

        inputs.forEach(input => {
            data[input.name] = input.value;
        });

        return data;
    },
    unbind(element, eventType) {
        const handlers = element[eventType];
        if (handlers) {
            handlers.forEach(handler => {
                element.removeEventListener(eventType, handler);
            });
            element[eventType] = [];
        }
    }
};
export default utils;
