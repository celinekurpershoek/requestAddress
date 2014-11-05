//Based on the jquery api: https://github.com/boye/PAPI/blob/master/jquery.papi.js
//http://www.postcodeapi.nu/#request

(function (d) {
	"use strict";

	var config = {
		urlZipcode: 'http://api.postcodeapi.nu/',
		triggerSelector: '[data-address-request-trigger]',
		inputStreet: '[data-input-street]',
		inputZipcodeDigits: '[data-input-zipcode-digits]',
		inputZipcodeLetters: '[data-input-zipcode-letters]',
		inputTown: '[data-input-town]',
		apiKey: '4p1K3y' /*replace with your own*/
	};

	function Requestaddress (element, options) {
		var isCapablebrowsers = 'querySelector' in d;
		if(!isCapablebrowsers){return d;}

		if (element) {
			this.init(element, options);
		} else {
			var elements = d.querySelectorAll('[data-address-request]');
			[].forEach.call(elements, function (element) {
				new Requestaddress(element, options);
			});
			return Requestaddress.instances;
		}
	}

	Requestaddress.instances = [];

	Requestaddress.prototype.init = function (element, options) {
		this.element = element;
		this.settings = extend(this.defaults(element), options);
		this.triggers = element.querySelectorAll(this.settings.triggerSelector);
		this.data = {};
		this.zipcode = '';

		this.bind();

		return this;
	};


	Requestaddress.prototype.bind = function () {
		var component = this;

		function blurEvent(event) {
			//event.preventDefault();
			component.getaddress.call(component);
		}

		// link content elements
		[].forEach.call(this.triggers, function (trigger) {
			trigger.addEventListener('blur', blurEvent, false);
		});
		return this;
	};

	Requestaddress.prototype.defaults = function () {
		return {
			urlZipcode: 'http://api.postcodeapi.nu/',
			triggerSelector: '[data-address-request-trigger]',
			inputStreet: '[data-input-street]',
			inputZipcodeDigits: '[data-input-zipcode-digits]',
			inputZipcodeLetters: '[data-input-zipcode-letters]',
			inputTown: '[data-input-town]',
			apiKey: '502066f7c549b6f86bd4f34c5bd8fd7f312706c4'
		};
	};

	Requestaddress.prototype.doServerRequest = function (url) {
		var component = this;
		var xmlHttp = new XMLHttpRequest();

		xmlHttp.open('get', url, false);
		xmlHttp.setRequestHeader('Api-Key', component.settings.apiKey);
		//xmlHttp.onreadystatechange = component._handleServerResponse;
		xmlHttp.send();
		//what to return here?
		return JSON.parse(xmlHttp.responseText);
	};

	Requestaddress.prototype._handleServerResponse = function (request) {

		if (request.target.readyState === 4) {
			if (request.target.status === 200) {
				this.data.resource.error = 0;
			} else {
				this.data = {
					resource : {
						error: 1,
						errorMessage: 'Unknown zipcode'
					}
				};
			}
		}

		return this.data;
	};

	/**
	 * get the valid zipcode
	 * do a server reqeust with the zipcode
	 * set the address
	 * return this?
	 */
	Requestaddress.prototype.getaddress = function () {
		var component = this;
		var zipcode = this.getValidZipcode();

		//dont do a request for same zipcode
		if(zipcode === this.zipcode){return component;}

		if(zipcode) {
			var proxyUrl = component.settings.urlZipcode + zipcode;
			var requestedData = this.doServerRequest(proxyUrl);

			//if(requestedData){
				this.setaddress(requestedData.resource);
				this.zipcode = zipcode;
			//}

		}
		return component;
	};

	Requestaddress.prototype.getValidZipcode = function () {
		var digits = d.querySelector(config.inputZipcodeDigits);
		var letters = d.querySelector(config.inputZipcodeLetters);

		var regex = '^[1-9][0-9]{3} ?[a-zA-Z]{2}$';
		var pattern = new RegExp(regex);
		var zipcode = digits.value + letters.value;
		zipcode = zipcode.replace(/\s+/g,'');

		var validZipcode = pattern.test(zipcode) ? zipcode : false;

		return validZipcode;
	};

	Requestaddress.prototype.setaddress = function (data) {
		var inputStreet = d.querySelector(config.inputStreet);
		var inputTown = d.querySelector(config.inputTown);

		//if(data.error === 0){
			inputStreet.value = data.street;
			inputTown.value = data.town;
		//}

		return data;
	};

	/**
	 * Helper
	 * Shallow extend first object with properties of a second object.
	 * @param {Object} obj1
	 * @param {Object} obj2
	 */
	function extend(obj1, obj2) {
		for (var prop in obj2) {
			if (obj2.hasOwnProperty(prop)) {
				obj1[prop] = obj2[prop];
			}
		}
		return obj1;
	}


	window.Requestaddress = Requestaddress;
	window.Requestaddress();

})(document);
