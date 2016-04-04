"use strict";angular.module("app",["ngResource","ngTouch","ngRoute","ui.router"]).config(["$stateProvider","$urlRouterProvider",function(a,b){b.otherwise("/calculator"),a.state("calculator",{url:"/calculator",views:{"":{templateUrl:"views/calculator.html"},"data-setup":{templateUrl:"views/data-setup.html"},voting:{templateUrl:"views/voting.html"}}})}]),angular.module("app").controller("MainCtrl",function(){}),angular.module("app").controller("DataSetupController",["$scope","$rootScope","$anchorScroll","$location",function(a,b,c,d){a.loan={amount:225e3,termInYears:30},a.options=[{rate:4,points:0},{rate:3.875,points:1}],a.comparing=!1,a.monthlyExtraPayment={frequency:"month"},a.months=["january","february","march","april","may","june","july","august","september","october","november","december"],a.annualPaymentMonth="december",a.annualExtraPayment=null;var e=function(){return[a.monthlyExtraPayment,{frequency:"annual",inMonth:a.annualPaymentMonth,payment:a.annualExtraPayment}]},f=function(){_.each(a.options,function(b){_.some([b.points,b.rate],_.isUndefined)||(b.monthlyPayment=-PMT(b.rate/12/100,12*a.loan.termInYears,a.loan.amount),b.pointsCost=window.roundUpTo(b.points/100*a.loan.amount))}),b.$emit("compareOptions",a.options,a.loan,e())};a.$watch("monthlyExtraPayment",f,!0),a.$watch("annualPaymentMonth",f,!0),a.$watch("annualExtraPayment",f,!0),a.$watch("options",f,!0),a.$watch("loan",f,!0),a.compare=function(){a.comparing=!0,b.$emit("compareOptions",a.options,a.loan,e()),b.$emit("showCompare"),setTimeout(function(){d.hash("comparisons"),c()},0)}}]),angular.module("app").controller("MortgageController",["$scope","$rootScope","$location","MortgageCalculator","MortgagePointsComparer",function(a,b,c,d,e){a.range=function(a){return new Array(a)},a.originalIndexOfOption=function(b){return _.indexOf(a.originalOptions,b)},b.$on("showCompare",function(){a.comparing=!0}),b.$on("compareOptions",function(b,c,d,f){a.originalOptions=c,_.each(a.options,function(a){a.pointsCost=.01*a.points*d.amount}),a.options=_.sortBy(c,"pointsCost"),a.comparison=e.compare(d,a.options[0],a.options[1],f),a.monthlyExtraPayment=_.find(f,{frequency:"month"}),a.annualExtraPayment=_.find(f,{frequency:"annual"}),console.log("Checking extra")})}]),angular.module("app").filter("monthsAsDuration",function(){return function(a){var b=moment.duration(a,"months");return b.get("year")+" years "+b.get("months")+" months"}}),angular.module("app").factory("MortgageCalculator",[function(){var a=function(a,b){var c=_.get(_.find(b,{frequency:"month"}),"payment",0),d=_.find(b,{frequency:"annual"});d=d||{inMonth:"december",payment:0};for(var e=a.rate/12/100,f=-window.PMT(e,12*a.termInYears,a.amount),g={totalInterest:[0],interest:[0],balance:[a.amount],monthlyPayment:f},h=0;h<12*a.termInYears+1&&_.last(g.balance)>0;h++){var i=c;moment().add(h,"months").format("MMMM").toLowerCase()===d.inMonth&&(i+=_.get(d,"payment",0));var j=_.last(g.balance),k=roundUpTo(e*j,2);j+=roundTo(k-f-i,2),0>j&&(j=0),g.interest.push(k),g.totalInterest.push(roundTo(k+_.sum(g.interest),2)),g.balance.push(j),g.paymentsUntilPayoff=h+1}return g};return{calculate:a}}]),angular.module("app").factory("MortgagePointsComparer",["MortgageCalculator",function(a){var b=function(b,c,d,e){var f=_.clone(b,!0);f.rate=c.rate;var g=d.pointsCost-c.pointsCost;f.amount-=g;var h=a.calculate(f,e),i=_.clone(b,!0);i.rate=d.rate;for(var j=a.calculate(i,e),k=-1,l=0;l<Math.min(h.interest.length,j.interest.length);l++)if(j.totalInterest[l]+g<h.totalInterest[l]){k=l+1;break}var m=_.last(h.totalInterest),n=roundTo(_.last(j.totalInterest)+g,2);return{totalCosts:[m,n],mortgages:[h,j],paymentsUntilBreakEven:k}};return{compare:b}}]),window.roundUpTo=function(a,b){b=b||2;var c=Math.pow(10,b);return Math.ceil(a*c)/c},window.PMT=function(a,b,c,d,e){var f,g;return d=d||0,e=e||0,0===a?-(c+d)/b:(g=Math.pow(1+a,b),f=-a*c*(g+d)/(g-1),1===e&&(f/=1+a),roundUpTo(f,2))},window.roundUpTo=function(a,b){b=b||2;var c=Math.pow(10,b);return Math.ceil(a*c)/c},window.roundTo=function(a,b){b=b||2;var c=Math.pow(10,b);return Math.round(a*c)/c},angular.module("app").run(["$templateCache",function(a){a.put("views/calculator.html",'<div class="row"> <div class="columns medium-12"> <h1>Mortgage Points</h1> </div> </div> <div ui-view="data-setup@"></div> <div ng-controller="MortgageController" class="row" ng-show="comparing" id="comparisons"> <div class="columns medium-12"> <p> <span ng-repeat="option in options"> In option #{{originalIndexOfOption(option) + 1}}, <span ng-show="option.pointsCost >= 0">you pay the lender {{option.pointsCost | currency}}</span><span ng-show="option.pointsCost < 0">you receive {{-option.pointsCost | currency}}</span> for an interest rate of {{option.rate}}%. </span> </p> <p>Instead of paying {{options[1].pointsCost | currency}} for a rate of {{options[1].rate}}%, you could put {{options[1].pointsCost - options[0].pointsCost | currency}} directly into mortgage option #{{originalIndexOfOption(options[0]) + 1}} with the rate of {{options[0].rate}}%.</p> <p ng-show="monthlyExtraPayment.payment > 0 || annualExtraPayment.payment > 0">Because you are paying <span ng-show="monthlyExtraPayment.payment > 0">{{monthlyExtraPayment.payment | currency}} extra per month</span><span ng-show="monthlyExtraPayment.payment > 0 && annualExtraPayment.payment > 0"> and </span><span ng-show="annualExtraPayment.payment > 0">{{annualExtraPayment.payment | currency}} extra per year</span>, you will pay off mortgage option #{{originalIndexOfOption(options[0]) + 1}} in {{comparison.mortgages[0].paymentsUntilPayoff}} payments ({{comparison.mortgages[0].paymentsUntilPayoff | monthsAsDuration}}), and {{comparison.mortgages[1].paymentsUntilPayoff}} payments ({{comparison.mortgages[1].paymentsUntilPayoff | monthsAsDuration}}) for option #{{originalIndexOfOption(options[1]) + 1}}.</p> <p ng-show="comparison.paymentsUntilBreakEven >= 0">It will take {{comparison.paymentsUntilBreakEven}} mortgage payments for option #{{originalIndexOfOption(options[1]) + 1}} to save you money, or {{comparison.paymentsUntilBreakEven | monthsAsDuration}}. If you keep this mortgage until it\'s paid off, you will save {{comparison.totalCosts[0] - comparison.totalCosts[1] | currency}}.</p> <p ng-show="comparison.paymentsUntilBreakEven < 0">Option #{{originalIndexOfOption(options[1]) + 1}} will never save you money over the life of the loan. If you pay for this option and keep the mortgage until it is paid off, you will lose {{comparison.totalCosts[1] - comparison.totalCosts[0] | currency}}.</p> </div> <div class="columns medium-12"> <div ui-view="voting@"></div> </div> </div>'),a.put("views/data-setup.html",'<form novalidate ng-controller="DataSetupController" name="dataForm"> <div class="row"> <div class="columns large-12"> <p> A "point" on a mortgage is an up-front cost you pay getting the mortgage equal to 1% of mortgage amount. Based on the lending climate, lenders will offer higher or lower rate discounts based on points. You may even be offered a higher rate for negative points - a cash value up front for a higher interest rate. </p> <p>The longer you have the loan, the more of an effect a lower rate has on the loan. So when you\'re paying extra each month and shortening the length of the loan, the break-even date for purchasing mortgage points changes dramatically.</p> </div> <div class="large-6 columns"> <label>Loan Amount <input type="number" ng-model="loan.amount" step="5000"> </label> </div> <div class="large-6 columns"> <label>Term <select ng-model="loan.termInYears" ng-options="value as value for value in [15,30]"> </select> </label> </div> <div class="large-12 columns"> <h2>Extra Payments</h2> <div class="row"> <div class="columns medium-6"> <div class="row collapse"> <div class="small-4 columns"> <span class="prefix">Pay</span> </div> <div class="small-8 columns"> <input type="number" placeholder="0" step="50" ng-model="monthlyExtraPayment.payment"> </div> </div> </div> <div class="columns medium-6"> <span class="prefix">extra per month</span> </div> </div> <div class="row"> <div class="columns medium-6"> <div class="row collapse"> <div class="small-4 columns"> <span class="prefix">Pay</span> </div> <div class="small-8 columns"> <input type="number" placeholder="0" step="1000" ng-model="annualExtraPayment"> </div> </div> </div> <div class="columns medium-3"> <span class="prefix">extra per year in</span> </div> <div class="columns medium-3"> <select ng-options="month as month for month in months" ng-model="annualPaymentMonth" ng-value="month"></select> </div> </div> </div> <div ng-repeat="option in options"> <div class="columns large-12"> <h2>Lender Option #{{$index+1}}</h2> </div> <div class="large-3 columns"> <label>Interest Rate <input type="number" ng-model="option.rate" required placeholder="4.5" step="0.125"> </label> </div> <div class="large-3 columns"> <label>Points <input type="number" ng-model="option.points" required placeholder="0"> </label> </div> <div class="large-2 columns"> <label>Points cost ($): <input type="number" disabled ng-value="option.pointsCost"></label> </div> <div class="large-2 columns"> <label>Monthly Payment: <input type="number" disabled ng-model="option.monthlyPayment"></label> </div> <div class="large-2 columns"> With Extra: {{option.monthlyPayment + monthlyExtraPayment.payment | currency}} </div> </div> <div class="columns large-12"> <button class="button" ng-disabled="dataFrom.$invalid" ng-click="compare()">Compare </button> </div> </div> </form>'),a.put("views/voting.html",'<h1 class="margin-top-2">Just a sec!</h1> <p>Please help me out and take a short 3-question survey about this calculator. Your responses determine what comes next!</p> <a href="http://goo.gl/forms/vjG5yBD5aS" target="_blank" class="button success" style="width:100%">Sure!</a>')}]);