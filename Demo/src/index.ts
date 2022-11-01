class People2 {};

@classDecorator
class People {

    constructor(@valueDecorator public name: string) {}

    @fnDecorator
    public song () {};
};

function classDecorator(...args: any[]) {
    console.log("classDecorator执行");
    console.log(args);
};

function valueDecorator(...args: any[]) {
    console.log(args);
}

function fnDecorator(...args: any[]) {
    console.log(args);
}

const people = new People("CodeGorgeous");
console.log(people);