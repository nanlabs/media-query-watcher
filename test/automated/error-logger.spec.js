var ErrorLogger = require('../../src/js/error-logger');

function validateItem(item, componentId, code, description, customData) {
	expect(item).to.have.property('componentId', componentId);
	expect(item).to.have.property('code', code);
	expect(item).to.have.property('description', description);
	expect(item).to.have.property('data');
	expect(item.data).to.deep.equal(customData);
}

function buildError(code, description, customData, componentId) {
  if(componentId) {
    return {
      componentId: componentId,
      code: code,
      description: description,
      data: customData
    };
  } else {
    return {
      code: code,
      description: description,
      data: customData
    };
  }
}

describe('Error Logger', function() {
	var COMPONENT_ID = 'aComponent';
	var ERROR_CODE_1 = 'error_code1';
	var ERROR_DESCRIPTION_1 = 'an error description 1';
	var CUSTOM_DATA_1 = {
		myCustomAttribute1: '123'
	};

	var ERROR_CODE_2 = 'error_code2';
	var ERROR_DESCRIPTION_2 = 'an error description 2';
	var CUSTOM_DATA_2 = {
		myCustomAttribute2: '987'
	};

	var ERROR_CODE_3 = 'error_code3';

	var logger, validator;
	beforeEach(function(){
		logger = new ErrorLogger();
		expect(logger.errors).to.be.empty;
	});

	afterEach(function(){
    validator = null;
		logger = null;
	});

  it('should automatically create the ErrorLogger in "xteam.error.logger" after loading the module', function() {
    expect(window.xteam).to.exist;
    expect(window.xteam.error.logger).to.exist;
    expect(window.xteam.error.logger).to.be.an.instanceof(ErrorLogger);
  });

	it('should start with an empty list of errors', function() {
		expect(logger.errors).to.exist;
		expect(logger.errors).to.be.empty;
	});

  it('should indicate it has no errors if the errors array is empty', function() {
    expect(logger.errors).to.exist;
    expect(logger.errors).to.be.empty;
    expect(logger.hasErrors()).to.be.false;
  });

  it('should indicate it has errors if the errors array is not empty', function() {
    logger.addError(COMPONENT_ID, ERROR_CODE_1, ERROR_DESCRIPTION_1, CUSTOM_DATA_1);

    expect(logger.hasErrors()).to.be.true;
  });


	it('should create the error object correctly and store it when requested', function() {
		logger.addError(COMPONENT_ID, ERROR_CODE_1, ERROR_DESCRIPTION_1, CUSTOM_DATA_1);

		expect(logger.errors).to.have.length(1);

		validateItem(logger.errors[0], COMPONENT_ID, ERROR_CODE_1, ERROR_DESCRIPTION_1, CUSTOM_DATA_1);
	});

	it('should correctly clear the error list', function() {
		logger.addError(COMPONENT_ID, ERROR_CODE_1, ERROR_DESCRIPTION_1, CUSTOM_DATA_1);
		expect(logger.errors).to.have.length(1);

		logger.clear();

		expect(logger.errors).to.be.empty;
	});

	it('should allow to add multiple errors in different calls', function() {
		logger.addError(COMPONENT_ID, ERROR_CODE_1, ERROR_DESCRIPTION_1, CUSTOM_DATA_1);
		logger.addError(COMPONENT_ID, ERROR_CODE_2, ERROR_DESCRIPTION_2, CUSTOM_DATA_2);

		expect(logger.errors).to.have.length(2);

		validateItem(logger.errors[0], COMPONENT_ID, ERROR_CODE_1, ERROR_DESCRIPTION_1, CUSTOM_DATA_1);
		validateItem(logger.errors[1], COMPONENT_ID, ERROR_CODE_2, ERROR_DESCRIPTION_2, CUSTOM_DATA_2);
	});

	it('should allow to add multiple errors in one call', function() {
		var errors = [
			buildError(ERROR_CODE_1, ERROR_DESCRIPTION_1, CUSTOM_DATA_1),
			buildError(ERROR_CODE_2, ERROR_DESCRIPTION_2, CUSTOM_DATA_2)
		];

		logger.addErrors(COMPONENT_ID, errors);

		expect(logger.errors).to.have.length(2);

		validateItem(logger.errors[0], COMPONENT_ID, ERROR_CODE_1, ERROR_DESCRIPTION_1, CUSTOM_DATA_1);
		validateItem(logger.errors[1], COMPONENT_ID, ERROR_CODE_2, ERROR_DESCRIPTION_2, CUSTOM_DATA_2);
	});

	it('should allow to add errors with only component id and code. Description should be empty and data should be an empty object', function() {
		logger.addError(COMPONENT_ID, ERROR_CODE_1, null, null);
		logger.addError(COMPONENT_ID, ERROR_CODE_2, '', '');
		logger.addError(COMPONENT_ID, ERROR_CODE_3);

		expect(logger.errors).to.have.length(3);

		validateItem(logger.errors[0], COMPONENT_ID, ERROR_CODE_1, '', {});
		validateItem(logger.errors[1], COMPONENT_ID, ERROR_CODE_2, '', {});
		validateItem(logger.errors[2], COMPONENT_ID, ERROR_CODE_3, '', {});
	});

  it('should reject errors with a null error code. Instead it should log that a component tried to add an invalid error', function() {
    var error = buildError(null, ERROR_DESCRIPTION_1, CUSTOM_DATA_1, COMPONENT_ID);
    logger.addError(error.componentId, error.code, error.description, error.data);

    expect(logger.errors).to.have.length(1);

    validateItem(logger.errors[0], 'ErrorLogger', 'missing_required_field', 'The error field does not contain a componentId and/or an error code', {originalError: error});
  });

   it('should reject errors with an empty error code. Instead it should log that a component tried to add an invalid error', function() {
    var error = buildError('', ERROR_DESCRIPTION_1, CUSTOM_DATA_1, COMPONENT_ID);
    logger.addError(error.componentId, error.code, error.description, error.data);

    expect(logger.errors).to.have.length(1);

    validateItem(logger.errors[0], 'ErrorLogger', 'missing_required_field', 'The error field does not contain a componentId and/or an error code', {originalError: error});
  });

  it('should reject errors with a null component id. Instead it should log that a component tried to add an invalid error', function() {
    var error = buildError(ERROR_CODE_1, ERROR_DESCRIPTION_1, CUSTOM_DATA_1);
    error.componentId = null;
    logger.addError(error.componentId, error.code, error.description, error.data);

    expect(logger.errors).to.have.length(1);

    validateItem(logger.errors[0], 'ErrorLogger', 'missing_required_field', 'The error field does not contain a componentId and/or an error code', {originalError: error});
  });

  it('should reject errors with an empty component id. Instead it should log that a component tried to add an invalid error', function() {
    var error = buildError(ERROR_CODE_1, ERROR_DESCRIPTION_1, CUSTOM_DATA_1);
    error.componentId = '';
    logger.addError(error.componentId, error.code, error.description, error.data);

    expect(logger.errors).to.have.length(1);

    validateItem(logger.errors[0], 'ErrorLogger', 'missing_required_field', 'The error field does not contain a componentId and/or an error code', {originalError: error});
  });


  it('should be able to show the errors on console', function() {
    var error1 = buildError(ERROR_CODE_1, ERROR_DESCRIPTION_1, CUSTOM_DATA_1, COMPONENT_ID);
    var error2 = buildError(ERROR_CODE_2, ERROR_DESCRIPTION_2, CUSTOM_DATA_2, COMPONENT_ID);

    logger.addError(COMPONENT_ID, ERROR_CODE_1, ERROR_DESCRIPTION_1, CUSTOM_DATA_1);
    logger.addError(COMPONENT_ID, ERROR_CODE_2, ERROR_DESCRIPTION_2, CUSTOM_DATA_2);
    var spy = sinon.spy(console, "error");
    //var stub = sinon.stub(JSON, 'stringify');


    logger.show();

    // Check if console.error was called as expected.
    expect(spy).to.have.been.calledTwice;
    expect(spy).to.have.been.calledWithExactly(JSON.stringify(error1));
    expect(spy).to.have.been.calledWithExactly(JSON.stringify(error2));
  });

});
