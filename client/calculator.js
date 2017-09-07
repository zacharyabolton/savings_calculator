import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './calculator.html';

let calculator = function(principle, amountToSave, saveEvery, savePeriod, until, APY, compoundingPeriods, amountToIncrement, incrementEvery, incrementPeriod){
	
	var result, d, dn, startYearMonth, startMonthDay, halfYear, startQuarter, monthsTranspiredForSave, yearsTranspiredForSave, monthsTranspiredForInc, yearsTranspiredForInc;
	result = principle;
	d = new Date();
	dn = Number(d);
	startYearMonth = d.getFullYear()+"/"+d.getMonth();
	if(d.getMonth()+"/"+d.getDate() === "1/29"){//start MM/DD (28th for leap day)
		startMonthDay = "1/28";
	}else{
		startMonthDay = d.getMonth()+"/"+d.getDate();
	};///////////////////////////////////////////////////////////////////////////
	halfYear = new Date(d.setMonth(d.getMonth()+6)).getMonth()+"/"+d.getDate();

	var quarter = function(day){
		var currentMonth = new Date(day).getMonth();
		var currentYear = new Date(day).getFullYear();
		if(currentMonth < 3){
			return "1st quarter "+currentYear;
		}else if(currentMonth < 6){
			return "2nd quarter "+currentYear;
		}else if(currentMonth < 9){
			return "3rd quarter "+currentYear;
		}else{
			return "4th quarter "+currentYear;
		};
	};

	startQuarter = quarter(dn);
	monthsTranspiredForSave = 0;
	yearsTranspiredForSave = 0;
	monthsTranspiredForInc = 0;
	yearsTranspiredForInc = 0;

	for (var day = dn+86400000; day <= until+86400000; day+=86400000) {
		
		var startOfYear, endOfYear, lengthOfYear, elapsedTime, monthlySaveDate, yearlySaveDate;

		startOfYear = new Date(new Date(day).getFullYear()+"/01/01");
		endOfYear = new Date(new Date(startOfYear).getFullYear()+"/12/32");
		startOfYear = Number(startOfYear);
		endOfYear = Number(endOfYear);
		lengthOfYear = endOfYear-startOfYear;
		elapsedTime = day-dn;
		if(d.getDate() > 28){
			monthlySaveDate = 28;
		}else{
			monthlySaveDate = d.getDate();
		};
		if((d.getMonth()+"/"+d.getDate()) === "1/29"){
			yearlySaveDate = "1/28";
		}else{
			yearlySaveDate = d.getMonth()+"/"+d.getDate();
		}

		if(compoundingPeriods === 365 || compoundingPeriods === 366){//daily compounding
			//////////////////////////////////////////////////////////////////////////////
			compoundingPeriods = lengthOfYear/86400000;
			result = totalAfterInterest(APY, compoundingPeriods, result);
			//////////////////////////////////////////////////////////////////////////////
		}else if(compoundingPeriods===12){///////////////////////////monthly compounding
			//////////////////////////////////////////////////////////////////////////////
			var currentYearMonth = new Date(day).getFullYear()+"/"+new Date(day).getMonth();
			if(startYearMonth !== currentYearMonth){
				result = totalAfterInterest(APY, compoundingPeriods, result);
				startYearMonth = currentYearMonth;
			}
			//////////////////////////////////////////////////////////////////////////////
		}else if(compoundingPeriods===4){//////////////////////////quarterly compounding
			//////////////////////////////////////////////////////////////////////////////
			var currentQuarter = quarter(day);
			if(startQuarter !== currentQuarter){

				startQuarter = quarter(day);
				result = totalAfterInterest(APY, compoundingPeriods, result);
			}
			//////////////////////////////////////////////////////////////////////////////
		}else if(compoundingPeriods===2){////////////////////////semiannualy compounding
			//////////////////////////////////////////////////////////////////////////////
			var currentMonthDay = new Date(day).getMonth()+"/"+new Date(day).getDate();
			if(currentMonthDay === startMonthDay){
				result = totalAfterInterest(APY, compoundingPeriods, result);
			}else if(currentMonthDay === halfYear){
				result = totalAfterInterest(APY, compoundingPeriods, result);
			}
			//////////////////////////////////////////////////////////////////////////////
		}else if(compoundingPeriods===1){/////////////////////////////yearly compounding
			//////////////////////////////////////////////////////////////////////////////
			var currentMonthDay = new Date(day).getMonth()+"/"+new Date(day).getDate();
			if(currentMonthDay === startMonthDay){
				result = totalAfterInterest(APY, compoundingPeriods, result);
			}
			//////////////////////////////////////////////////////////////////////////////
		};

		if(savePeriod === "day"){
			if(elapsedTime % (86400000*saveEvery) === 0){
				result += amountToSave;
			}
		}else if(savePeriod === "week"){
			if(elapsedTime % (86400000*7*saveEvery) === 0){
				result += amountToSave;
			}
		}else if(savePeriod === "month"){
			var todaysDate = new Date(day).getDate();
			if((d.getFullYear()+"/"+d.getMonth()) !== (new Date(day).getMonth()+"/"+new Date(day).getMonth())){
				if(todaysDate === monthlySaveDate){
					monthsTranspiredForSave++;
					if(monthsTranspiredForSave % saveEvery === 0){
						result += amountToSave;
					}
				}
			}
		}else if(savePeriod === "year"){
			var todaysDate = new Date(day).getMonth()+"/"+new Date(day).getDate();
			if(todaysDate === yearlySaveDate){
				yearsTranspiredForSave++;
				if(yearsTranspiredForSave % saveEvery === 0){
					result += amountToSave;
				}
			}
		};

		if(incrementPeriod === "day"){
			if(elapsedTime % (86400000*incrementEvery) === 0){
				amountToSave += amountToIncrement;
			}
		}else if(incrementPeriod === "week"){
			if(elapsedTime % (86400000*7*incrementEvery) === 0){
				amountToSave += amountToIncrement;
			}
		}else if(incrementPeriod === "month"){
			var todaysDate = new Date(day).getDate();
			if((d.getFullYear()+"/"+d.getMonth()) !== (new Date(day).getMonth()+"/"+new Date(day).getMonth())){
				if(todaysDate === monthlySaveDate){
					monthsTranspiredForInc++;
					if(monthsTranspiredForInc % incrementEvery === 0){
						amountToSave += amountToIncrement;
					}
				}
			}
		}else if(incrementPeriod === "year"){
			var todaysDate = new Date(day).getMonth()+"/"+new Date(day).getDate();
			if(todaysDate === yearlySaveDate){
				yearsTranspiredForInc++;
				if(yearsTranspiredForInc % incrementEvery === 0){
					amountToSave += amountToIncrement;
				}
			}
		};
	};

	monthsTranspiredForSave = 0;
	yearsTranspiredForSave = 0;
	monthsTranspiredForInc = 0;
	yearsTranspiredForInc = 0;

	return numberWithCommas(result);

};

let numberWithCommas = function(x){
	x = x.toFixed(2);
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

let totalAfterInterest = function(APY, compoundingPeriods, result){
	return result*(1+((APY/100)/compoundingPeriods));
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

		var principle, amountToSave, saveEvery, savePeriod, until, APY, amountToIncrement, incrementEvery, incrementPeriod;
		principle = Number(template.find( '[name="principle"]' ).value);
		amountToSave = Number(template.find( '[name="amountToSave"]' ).value);
		saveEvery = Number(template.find( '[name="saveEvery"]' ).value);
		savePeriod = template.find( '[name="savePeriod"]' ).value;
		until = Number(new Date(template.find( '[name="until"]' ).value));
		APY = Number(template.find( '[name="APY"]' ).value);
		compoundingPeriods = Number(template.find( '[name="compoundingPeriods"]' ).value);
		amountToIncrement = Number(template.find( '[name="amountToIncrement"]' ).value);
		incrementEvery = Number(template.find( '[name="incrementEvery"]' ).value);
		incrementPeriod = template.find( '[name="incrementPeriod"]' ).value;

		var result = 	"$"
									+calculator(principle, amountToSave, saveEvery, savePeriod, until, APY, compoundingPeriods, amountToIncrement, incrementEvery, incrementPeriod)
									+" by "
									+moment(until).format('MMMM Do, YYYY');

		Template.instance().final.set(result);
	}
});