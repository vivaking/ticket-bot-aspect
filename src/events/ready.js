const { statuses, presences } = require("../../config.json");
module.exports = (client) => {
  console.log(`Logged in as ${client.user.username}`);

  let i = 0;

  setInterval(() => {
    const textArray = statuses;
    const activityArray = presences;

    client.user.setActivity(textArray[i], { type: activityArray[i] });

    i++;

    if (i == 3) i = 0;
  }, 60000);
};
