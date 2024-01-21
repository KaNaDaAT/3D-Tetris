export class ConfigurationAlreadySetError extends Error {
	constructor(class_name) {
		super();
		this.name = 'ConfigurationAlreadySetError';
		this.message = `The instance of '${class_name}' has already been configured.`;
		this.stack = (new Error()).stack;
	}
}