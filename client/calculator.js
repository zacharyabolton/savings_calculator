import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './calculator.html';

let calculator = function(principle, amount, every, period, until, APY, increment, incrementEvery, incrementPeriod){
	var result, now, rate;
	result = principle;
	now = Number(new Date());
	period = period*every;
	until = until+86400000;
	rate = nominalInterestRate(APY);
	incrementPeriod = incrementPeriod*incrementEvery;

	for (var day = now; day <= until; day+=86400000) {
		
		result 	= interestEarned(rate, result)
						+	save(amount, period, day, now, increment, incrementEvery, incrementPeriod);

		if(regularIncrement(incrementPeriod, day, now)){

			amount += increment;

		};
	};

	return "$"+result.toFixed(2);

};

let nominalInterestRate = function(APY){
	var A, P, r;
	P = 100;
	A = P+APY;
	r = 365*(Math.pow((A/P), (1/365))-1);

	return r;
};

let interestEarned = function(nominalInterestRate, principle){
	var A = principle*(1+(nominalInterestRate/365));

	return A;
};

let save = function(amount, period, day, now){
	var elapsedTime, tracker;
	elapsedTime = day-now;

	if(elapsedTime > 0){
		var timeToSave = (elapsedTime % period) === 0;

		if(timeToSave){

			return amount;
		}else{
			return 0;
		}

	}else{
		return 0;
	}
};

let regularIncrement = function(incrementPeriod, day, now){
	var elapsedTime = day-now;

	if(elapsedTime > 0){
		var timeToIncrement = (elapsedTime % incrementPeriod) === 0;

		if(timeToIncrement){
			console.log("fired");
			return true;
		}

		return false;
	}else{
		return false;
	}

};

Template.calculator.rendered=function() {
	$('#my-datepicker').datepicker({
		startDate: new Date(),
    autoclose: true,
    todayHighlight: true
	});
};

Template.calculator.onCreated(function calculatorOnCreated() {
  this.final = new ReactiveVar("");
});

Template.calculator.helpers({
	final(){
		return Template.instance().final.get();
	},
});

Template.calculator.events({
	'submit form':function(event, template, instance){

		event.preventDefault();

		var principle, amount, every, period, until, APY, increment, incrementEvery, incrementPeriod;
		principle = Number(template.find( '[name="principle"]' ).value);
		amount = Number(template.find( '[name="amount"]' ).value);
		every = Number(template.find( '[name="every"]' ).value);
		period = Number(template.find( '[name="period"]' ).value);
		until = Number(new Date(template.find( '[name="until"]' ).value));
		APY = Number(template.find( '[name="APY"]' ).value);
		increment = Number(template.find( '[name="increment"]' ).value);
		incrementEvery = Number(template.find( '[name="incrementEvery"]' ).value);
		incrementPeriod = Number(template.find( '[name="incrementPeriod"]' ).value);

		var result = 	calculator(principle, amount, every, period, until, APY, increment, incrementEvery, incrementPeriod)
									+" by "
									+moment(until).format('MMMM Do, YYYY');

		Template.instance().final.set(result);

	}
});