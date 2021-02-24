import {Item, ParsedCheckData} from "../types/interfaces";
import {v4} from "react-native-uuid";
import {storeRelationsAction} from "../actions/storage";
import {List} from "immutable";

interface Element {
    data: number,
    index: number;
    text: string;
}

interface TaggunObject {
    amounts: Element[],
    numbers: Element[],
    totalAmount: Element,
    taxAmount: Element,
}

interface GroupItem {
    numbers: List<number>;
    amount: Element;
    index: number;
}

class TaggunParser {
    static parse = (data: TaggunObject): ParsedCheckData => {
        console.log(data);
        const items: Item[] = [];
        let group = List<GroupItem>();
        for (const amount of data.amounts) {
            const item = group.findEntry(el => el.amount.text === amount.text);
            if (item) {
                const [key, val] = item;
                if (val.amount.data === amount.data && val.index === amount.index) continue;
                if (!val.numbers.includes(amount.data)) {
                    val.numbers = val.numbers.push(amount.data);
                    group.set(key, val);
                } else {
                    const arr = List<number>([amount.data]);
                    const obj: GroupItem = {numbers: arr, amount, index: amount.index};
                    group = group.push(obj);
                }
            } else {
                const arr = List<number>([amount.data]);
                const obj: GroupItem = {numbers: arr, amount, index: amount.index};
                group = group.push(obj);
            }
        }
        for (const {amount, numbers} of group) {
            if (items.find(item => item.text === amount.text)) continue;
            if (amount.text === data.totalAmount.text) continue;
            if (amount.data === 0 || amount.data < 0) continue;

            const numberObject = data.numbers.find(num => num.text === amount.text);
            let count = numberObject ? parseInt(numberObject.text) || 0 : 0;

            if (count === 0) {
                if (numbers && numbers.count() > 1) {
                    const [_count, price] = numbers;
                    amount.data = price;
                    if (count === 0) count = _count;
                }
            } else {
                if (numbers && numbers.count() > 1) {
                    const [, price] = numbers;
                    amount.data = price;
                }
            }
            let text = amount.text.trim();
            if (text.match(/\d+[.,]\d+%/)) {
                text = text.replace(/\d+[.,]\d+%/g, "");
                text = text.replace(/\s\d+[.,]\d+/g, "");
                text = text.replace("%", "");
                if (count === 0) count = 1;
            }
            if (text.length === 0) continue;
            if (text.includes(String(count)) && text.startsWith(String(count))) {
                const index = text.indexOf(String(count));
                text = text.substr(index + String(count).length).trim();
            }
            if (text.includes(String(count + ",00"))) {
                text = text.replace(count + ",00", "").trim();
            }
            if (text.includes(String(amount.data))) {
                const index = text.indexOf(String(amount.data));
                text = text.substring(0, index).trim();
            }
            const dotReplaced = String(amount.data).replace(".", ",");
            if (text.includes(dotReplaced)) {
                const index = text.indexOf(dotReplaced);
                text = text.substring(0, index).trim();
            }
            if (count === 0) count = 1;
            const item: Item = {
                uid: v4(),
                id: amount.index,
                count: count,
                text: text.trim(),
                price: amount.data
            };
            items.push(item);
        }
        console.log("items", items);
        return {
            items,
        }
    }
}

export default TaggunParser;
