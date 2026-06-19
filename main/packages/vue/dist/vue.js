(function () {
    'use strict';

    function sum(...args) {
        let sum = 0;
        for (let i = 0; i < arguments.length; i++) {
            sum += arguments[i];
        }
        return sum;
    }

    console.log(sum(10, 29, 49));

})();
//# sourceMappingURL=vue.js.map
