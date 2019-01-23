// sleep.js
// ========
module.exports {
    sleep: function (ms){
        new Promise(resolve => setTimeout(resolve, ms));
    }
};
