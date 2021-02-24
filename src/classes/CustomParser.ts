import { CustomParsedResponse, Item, ParsedCheckData } from "../types/interfaces";
import { v4 } from "react-native-uuid";

class CustomParser {
	static parse = (data: CustomParsedResponse): ParsedCheckData => {
		const items: Item[] = [];
		for (const item of data.rows) {
			items.push({
				uid: v4(),
				count: parseInt(String(item.count)) || 0,
				price: parseFloat(String(item.price)) || 0,
				text: item.text
			})
		}
		return {items}
	}
}

export default CustomParser;
