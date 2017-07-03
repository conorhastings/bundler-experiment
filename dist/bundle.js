var two = {
    cool: 'wow',
    dope: 'sick',
    nice: 'rad',
    christophercolumbus: 'sucks'
};var one = function one(arg) {
    return two[arg] || 'arg not found';
};console.log(one('cool'));console.log(one('nah'));