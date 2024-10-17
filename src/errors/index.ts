class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}

class OptionMissingError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "OptionMissingError";
    }
}

class NotValidOptionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotValidOptionError";
    }
}

export { ValidationError, OptionMissingError, NotValidOptionError }