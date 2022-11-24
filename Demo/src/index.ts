import { release, subscription, A, B, C } from "./Decorators";

@A
class Component1 {

    @release(["changeValue1"])
    public eventTriggerPoint() {
        console.log("TriggerPoint1");
    };

    @subscription(["changeValue1", "changeValue2"])
    private eventResponsePoint() {
        console.log("changeValue2");
    };
}

class Component2 {
    @release(["changeValue2"])
    public eventTriggerPoint() {
        console.log("TriggerPoint2");
    };

    @subscription(["changeValue1"])
    private eventResponsePoint() {
        console.log("changeValue1");
    };
}

const component1 = new Component1();
component1.eventTriggerPoint();