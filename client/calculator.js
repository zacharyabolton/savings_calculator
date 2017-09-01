import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './calculator.html';

let calculator = function(principle, amountToSave, saveEvery, savePeriod, until, APY, compoundingPeriods, increment, incrementEvery, incrementPeriod){

	savePeriod = savePeriod*saveEvery;
	incrementPeriod = incrementPeriod*incrementEvery;
	//until = until+86400000;//might not be needed after renovation!
	
	var result, now, rate, startMonth;
	result = principle;
	now = Number(new Date());
	startMonth = new Date().getMonth();

	for (var day = now; day <= until; day+=86400000) {
		
		startOfYear = new Date(new Date(day).getFullYear()+"/01/01");
		endOfYear = new Date(new Date(startOfYear).getFullYear()+"/12/32");
		startOfYear = Number(startOfYear);
		endOfYear = Number(endOfYear);
		lengthOfYear = endOfYear-startOfYear;

		if(compoundingPeriods === 365 || compoundingPeriods === 366){//daily compounding

			compoundingPeriods = lengthOfYear/86400000;

			result = totalAfterInterest(APY, compoundingPeriods, result);

		}else if(compoundingPeriods===12){//monthly compounding

			var startMonth;

			
			currentMonth = new Date(day).getMonth();
			if(startMonth !== currentMonth){
				startMonth = currentMonth
				result = totalAfterInterest(APY, compoundingPeriods, result);
			}

		}else if(compoundingPeriods===4){//quarterly compounding

			console.log("quarterly");
			console.log(compoundingPeriods);


		}else if(compoundingPeriods===1){//yearly compounding

			console.log("yearly");
			console.log(compoundingPeriods);

		}else{
			alert("error");//should never happen
		}

	};

	return result;

	// for (var day = now; day <= until; day+=86400000) {
		
	// 	result 	= totalAfterInterest(APY, compoundingPeriods, result)
	// 					+	save(amountToSave, savePeriod, day, now, increment, incrementEvery, incrementPeriod);

	// 	if(regularIncrement(incrementPeriod, day, now)){

	// 		amountToSave += increment;

	// 	};
	// };

	// return "$"+result.toFixed(2);

};

let totalAfterInterest = function(APY, compoundingPeriods, result){

	var r, totalAfterInterest;

	r = (   (Math.pow( ((APY/100)+1), (1/compoundingPeriods) ))   -1)*compoundingPeriods;

	totalAfterInterest = result*(1+(r/compoundingPeriods));
	
	return totalAfterInterest;

};



// let save = function(amountToSave, savePeriod, day, now){
// 	var elapsedTime, tracker;
// 	elapsedTime = day-now;

// 	if(elapsedTime > 0){
// 		var timeToSave = (elapsedTime % savePeriod) === 0;

// 		if(timeToSave){

// 			return amountToSave;
// 		}else{
// 			return 0;
// 		}

// 	}else{
// 		return 0;
// 	}
// };

// let regularIncrement = function(incrementPeriod, day, now){
// 	var elapsedTime = day-now;

// 	if(elapsedTime > 0){
// 		var timeToIncrement = (elapsedTime % incrementPeriod) === 0;

// 		if(timeToIncrement){
// 			console.log("fired");
// 			return true;
// 		}

// 		return false;
// 	}else{
// 		return false;
// 	}

// };

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

		var principle, amountToSave, saveEvery, savePeriod, until, APY, increment, incrementEvery, incrementPeriod;
		principle = Number(template.find( '[name="principle"]' ).value);
		amountToSave = Number(template.find( '[name="amountToSave"]' ).value);
		saveEvery = Number(template.find( '[name="saveEvery"]' ).value);
		savePeriod = template.find( '[name="savePeriod"]' ).value;
		until = Number(new Date(template.find( '[name="until"]' ).value));
		APY = Number(template.find( '[name="APY"]' ).value);
		compoundingPeriods = Number(template.find( '[name="compoundingPeriods"]' ).value);
		increment = Number(template.find( '[name="increment"]' ).value);
		incrementEvery = Number(template.find( '[name="incrementEvery"]' ).value);
		incrementPeriod = template.find( '[name="incrementPeriod"]' ).value;

		var result = 	calculator(principle, amountToSave, saveEvery, savePeriod, until, APY, compoundingPeriods, increment, incrementEvery, incrementPeriod)
									+" by "
									+moment(until).format('MMMM Do, YYYY');

		Template.instance().final.set(result);
	}
});