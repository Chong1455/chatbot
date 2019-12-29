const {WebhookClient} = require('dialogflow-fulfillment');

const mongoose = require('mongoose');
const Demand = mongoose.model('demand');
const Coupon = mongoose.model('coupon');

module.exports = app => {
	app.post('/', async (req, res) => {
		const agent = new WebhookClient({ request: req, response: res});
		
		function snoopy(agent) {
			agent.add(`Welcome to my Snoopy fulfillment!`);
		}
		
		async function learn(agent) {
			Demand.findOne({ 'course': agent.parameters.courses}, function(err, course) {
				if (course !== null) {
					course.counter++;
					course.save();
				} else {
					const demand = new Demand({course: agent.parameters.courses});
					demand.save();
				}
			});
			

            let coupon = await Coupon.findOne({'course': agent.parameters.courses});
            if (coupon !==null) {
            	responseText = `You want to learn about ${agent.parameters.courses}.
            		Here is a link to the course: ${coupon.link}`;
            }
            agent.add(responseText);
		}

		function fallback(agent) {
			agent.add(`I didn't understand`);
			agent.add(`I'm sorry, can you try again?`);
		}
		let intentMap = new Map();
		intentMap.set('snoopy', snoopy);
		intentMap.set('learn courses', learn);
		intentMap.set('Default Fallback Intent', fallback);

		agent.handleRequest(intentMap);
	});
}