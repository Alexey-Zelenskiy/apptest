import {FirebaseVisionTypes} from "@react-native-firebase/ml-vision";
import {inRange, isNumber, cloneDeep, sortBy, meanBy} from "lodash"
import {Item} from "../types/interfaces";
import {v4} from "react-native-uuid";

class Line {

    y: number = 0;
    elements: { x: number, value: string, lang: String[] }[] = [];

    constructor(y: number) {
        this.y = y;
    }

    addValue = (element: { x: number, value: string, lang: String[] }) => {
        this.elements.push(element)
    }
}

export class MlKitParser {

    infelicity = 10;
    lines: Line[] = [];
    lineDist: { [key: number]: number } = {};

    pushElement = (x: number, y: number, value: string, lang: String[]) => {
        let exists = false;
        for (const line of this.lines) {
            if (inRange(y, line.y, line.y + this.infelicity)
                || inRange(y, line.y - this.infelicity, line.y)) {
                line.addValue({x, value, lang});
                exists = true;
            }
        }
        if (!exists) {
            const line = new Line(y);
            line.addValue({x, value, lang});
            this.lines.push(line);
        }
    };

    parse = (data: FirebaseVisionTypes.VisionText) => {
        console.log(data);
        for (const block of data.blocks) {
            for (const line of block.lines) {
                console.log(line);
                const [x, y] = line.boundingBox;
                if (this.lines.length > 0) {
                    const lastLine = this.lines[this.lines.length - 1];
                    const diff = Math.abs(y - lastLine.y);
                    this.lineDist[diff] = (!this.lineDist[diff]) ? 1 : this.lineDist[diff] + 1;
                }
                this.pushElement(x, y, line.text, line.recognizedLanguages);
            }
        }
        const yArr = [];
        for (const line of this.lines) {
            yArr.push(line.y);
            line.elements = sortBy(line.elements, "x");
        }
        console.log("lineDist", this.lineDist);
        console.log("meanBy", meanBy(yArr));
    };

    getLines = () => {
        return this.lines;
    };

    getItems = () => {
        const items: Item[] = [];
        let i = 1;
        for (const line of this.lines) {
            //console.log(cloneDeep(line));
            if (line.elements.length < 2) {
                console.log(`line.elements.length < 2 ${line.y}`);
                continue
            }
            const lastElementNumber = parseFloat(line.elements[line.elements.length - 1].value);
            if (isNaN(lastElementNumber) || lastElementNumber === 0) {
                console.log(`isNaN ${line.y}`);
                continue
            }
            const textElement = line.elements.shift();
            if (!textElement) {
                console.log(`!textElement ${line.y}`, line.y);
                continue
            }
            const text = textElement.value as string;
            const checkCount = text.match(/^(\d+)/);
            let count;
            if (checkCount !== null) {
                const [full, _count] = checkCount;
                const parsedCount = parseInt(_count);
                if (!isNaN(parsedCount)) {
                    count = parsedCount;
                }
            }
            const price = parseFloat(line.elements.pop()!.value.replace(",", ".") as string);
            if (isNaN(price)) continue;
            if (!count) {
                count = parseInt(line.elements.pop()?.value as string) || 1;
            }
            const item = {
                uid: v4(),
                id: i,
                count: count,
                text: text,
                price: parseFloat(price.toFixed(2))
            };
            items.push(item);
            i++;
        }
        return items;
    }
}
