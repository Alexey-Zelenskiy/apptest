import {
    StyleSheet,
    View,
    Text,
    LayoutChangeEvent,
    Dimensions,
    SectionListRenderItemInfo,
    SectionList, SectionListData,
    TouchableOpacity, TouchableWithoutFeedback
} from "react-native";
import React, {useState, useEffect, useLayoutEffect, useRef} from "react";
import {useSelector} from "react-redux";
import {RootState} from "../../reducers";
import {Map, List} from "immutable";
import CirclePrice from "../circlePrice/CirclePrice";
import GestureRecognizer from 'react-native-swipe-gestures';
import Animated, {Easing} from "react-native-reanimated";
import {Item} from "../../types/interfaces";
import CheckItem from "../checkItem/CheckItem";
import {usersColor} from "../../constants/colors";
import {Alert} from "react-native";
import {useActions} from "../../hooks/actions";
import useTranslation from "../../hooks/useTranslation";
import useController, {Controller} from "../../hooks/useController";

interface Props {
    rootHeight: number,
    swipeDownSeed?: string;
    controller?: Controller
}

const {height: windowHeight} = Dimensions.get('window');

enum Position {TOP, BOTTOM}

interface Section {
    index: number;
    total: number;
    data: Item[],
}

const CheckPanel = ({rootHeight, swipeDownSeed, controller = useController()}: Props) => {

    const {deleteUser, setPanelHeight, storeRelations, storeUsers, setSplitByUser} = useActions();

    const [topAnim, setTopAnim] = useState(new Animated.Value<number>(windowHeight));
    const [position, setPosition] = useState(Position.BOTTOM);

    const [priceByUser, setPriceByUser] = useState<Map<string, number>>(Map());
    const [itemsByUser, setItemsByUser] = useState<Map<string, List<Item>>>(Map());
    const [sectionVisible, setSectionVisible] = useState(false);
    const [panelAllHeight, setPanelAllHeight] = useState(0);
    const [opacity, setOpacity] = useState(0);

    const users = useSelector((state: RootState) => state.check.users);
    const items = useSelector((state: RootState) => state.check.items);
    const usersItemsList = useSelector((state: RootState) => state.check.usersItemsList);
    const panelHeight = useSelector((state: RootState) => state.check.panelHeight);

    const scrollRef = useRef<SectionList<Section> | null>(null);

    useEffect(() => {
        //swipeDown();
    }, [swipeDownSeed]);

    useLayoutEffect(() => {
        if (rootHeight === 0) return;
        setTopAnim(new Animated.Value<number>(rootHeight - panelHeight));
        setOpacity(1);
    }, [rootHeight]);

    const {formatMessage: f} = useTranslation();

    const scrollTo = (index: number) => {
        if (!scrollRef.current) return;
        if (position === Position.BOTTOM) {
            swipeUp();
        } else {
            swipeDown();
        }
        scrollRef.current.scrollToLocation({sectionIndex: index, itemIndex: 0})
    };

    useEffect(() => {
        let prices = Map<string, number>();
        let pricesByItems: Map<string, number> = Map();
        let splitByUser: Map<string, List<Item>> = Map();
        for (const item of items) {
            const count: number = usersItemsList.filter(_item => _item.itemUid === item.uid).count();
            if (count === 0) continue;
            let price = items.find(_item => _item.uid === item.uid)!.price / count;
            pricesByItems = pricesByItems.set(item.uid, price);
        }
        let itemsCountByUsers: Map<string, number> = Map();
        items.map(item => {
            const count = usersItemsList.filter(el => el.itemUid === item.uid).count();
            if (count === 0) return;
            itemsCountByUsers = itemsCountByUsers.set(item.uid, count);
        });
        for (const user of users) {
            const unsortedItemsByUser: List<string> = usersItemsList.filter(item => item.userUid === user.uid)
                .map(item => item.itemUid);
            let sortedItemsByUser: List<string> = List();
            items.forEach(item => {
                if (unsortedItemsByUser.contains(item.uid)) {
                    sortedItemsByUser = sortedItemsByUser.push(item.uid);
                }
            });
            const price: number = sortedItemsByUser.reduce((price, itemUid) => {
                if (!pricesByItems.has(itemUid)) return price;
                return price + pricesByItems.get(itemUid)!
            }, 0);
            splitByUser = splitByUser.set(user.uid, sortedItemsByUser.map(uid => {
                const _item = items.find(item => item.uid === uid)!;
                const splitCount = (_item.count / itemsCountByUsers.get(uid)!).toFixed(2);
                const splitPrice = pricesByItems.get(uid)!;
                const item = {...items.find(i => i.uid === uid)!};
                item.price = splitPrice;
                item.count = parseFloat(splitCount);
                return item;
            }));
            prices = prices.set(user.uid, parseFloat(price.toFixed(2)));
        }
        setPriceByUser(prices);
        setItemsByUser(splitByUser);
        setSplitByUser(splitByUser);
    }, [users, items, usersItemsList]);

    useEffect(() => {
        setTimeout(() => {
            setSectionVisible(true);
        }, 1000);
    }, []);

    const deleteUserHandler = (userUid: string) => {
        deleteUser(userUid);
        storeUsers();
        storeRelations();
    };

    const deleteUserDialog = (userUid: string) => {
        Alert.alert(f({id: "dialog.delete.title"}), f({id: "dialog.delete.text"}), [
            {text: f({id: "dialog.delete.yes"}), onPress: () => deleteUserHandler(userUid)},
            {text: f({id: "dialog.delete.no"}), onPress: () => console.log('Cancel Pressed')}
        ], {cancelable: false})
    };

    const renderUsers = () => {
        return users.map(user => {
            const price = priceByUser.has(user.uid) ? priceByUser.get(user.uid) || null : null;
            return (
                <TouchableOpacity key={user.uid} style={styles.elementMargin}
                                  onPress={() => scrollTo(user.index)}
                                  onLongPress={() => deleteUserDialog(user.uid)}>
                    <CirclePrice userUid={user.uid} price={price}/>
                </TouchableOpacity>
            )
        })
    };

    const getTotalPrice = (): string => {
        return items.reduce((result, object) => result + object.price, 0).toFixed(2);
    };

    const onPriceLayout = ({nativeEvent: {layout: {height, width, x, y}}}: LayoutChangeEvent) => {
        if (position === Position.BOTTOM) {
            Animated.timing(
                topAnim,
                {
                    easing: Easing.out(Easing.poly(4)),
                    toValue: rootHeight - height,
                    //@ts-ignore
                    useNativeDriver: true,
                    duration: 300,
                }
            ).start();
        }
        setPanelHeight(height);
    };

    const swipeUp = () => {
        setPosition(Position.TOP);
        Animated.timing(
            topAnim,
            {
                easing: Easing.out(Easing.poly(4)),
                toValue: rootHeight - panelAllHeight,
                //@ts-ignore
                useNativeDriver: true,
                duration: 300,
            }
        ).start();
    };

    const swipeDown = () => {
        setPosition(Position.BOTTOM);
        Animated.timing(
            topAnim,
            {
                easing: Easing.out(Easing.poly(4)),
                toValue: rootHeight - panelHeight,
                //@ts-ignore
                useNativeDriver: true,
                duration: 300,
            }
        ).start();
    };

    const sectionClick = () => {
        swipeUp();
    };

    const renderItem = ({section, item}: SectionListRenderItemInfo<any>) => {
        if (!item) return null;
        const color = usersColor.getColor(section.index);
        return (
            <View style={[styles.item, {backgroundColor: color}]}>
                <CheckItem item={item} simple={true}/>
            </View>
        )
    };

    const renderSectionHeader = ({section}: { section: SectionListData<Section> }) => {
        const outerColor = section.index > 0 ? usersColor.getColor(section.index - 1) : "white";
        const innerColor = usersColor.getColor(section.index);
        return (
            <TouchableWithoutFeedback style={{backgroundColor: outerColor}} onPress={sectionClick}>
                <View style={[styles.sectionHeader, {backgroundColor: innerColor}]}>
                    <Text style={styles.sectionHeaderText}>{section.index + 1}</Text>
                    <Text style={styles.sectionHeaderText}>{section.total.toFixed(2)}</Text>
                </View>
            </TouchableWithoutFeedback>
        );
    };

    const renderSectionFooter = ({section}: { section: SectionListData<Section> }) => {
        const items = Array.isArray(section.data) ? section.data : [];
        if (items.length === 0) return null;
        const color = usersColor.getColor(section.index);
        return (
            <View style={[styles.sectionFooter, {backgroundColor: color}]}/>
        );
    };

    const sections: Section[] = [];
    users.forEach(user => {
        const items = itemsByUser.get(user.uid);
        if (items) {
            const totalPrice = items.reduce((sum: number, item: Item) => sum + item.price, 0);
            const section: Section = {index: user.index, total: totalPrice, data: items.toArray()};
            sections.push(section);
        }
    });

    const renderSectionList = () => {
        if (!sectionVisible) return null;
        return <SectionList ref={scrollRef} sections={sections}
                            stickySectionHeadersEnabled={true}
                            style={styles.detailBlock}
                            renderSectionHeader={renderSectionHeader}
                            renderSectionFooter={renderSectionFooter}
                            keyExtractor={(item: Item) => item.uid}
                            renderItem={renderItem}/>
    };

    const renderLostPrice = () => {
        let allItemsDistributed = true;
        items.forEach(item => {
            const exists = usersItemsList.find(el => el.itemUid === item.uid);
            if (!exists) allItemsDistributed = false
        });
        if (allItemsDistributed) return null;
        const usersPrice = users.reduce((total, user) => total + (priceByUser.has(user.uid) ? priceByUser.get(user.uid) || 0 : 0), 0);
        const diff = parseFloat(getTotalPrice()) - usersPrice;
        return <Text style={styles.priceLostText}>{diff.toFixed(2)}</Text>
    };

    const onLayoutPanel = ({nativeEvent: {layout: {height, width, x, y}}}: LayoutChangeEvent) => {
        setPanelAllHeight(height);
    };

    return (
        <Animated.View style={[styles.panel, {top: topAnim, elevation: 10, opacity: opacity}]} onLayout={onLayoutPanel}>
            <GestureRecognizer
                onSwipeUp={swipeUp}
                onSwipeDown={swipeDown}>
                <View onLayout={onPriceLayout} style={styles.priceBlock}>
                    <View style={{marginTop: 9}}>
                        <View style={styles.moveAnchor}/>
                        <View style={{flexDirection: "row"}}>
                            <View style={styles.totalPriceArea}>
                                {renderUsers()}
                                {renderLostPrice()}
                            </View>
                            <View style={styles.priceContainer}>
                                <Text style={styles.totalText}>{f({id: "total"})}</Text>
                                <Text style={styles.priceText}>{getTotalPrice()}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </GestureRecognizer>
            <View>
                {renderSectionList()}
            </View>
        </Animated.View>
    )
};

export default CheckPanel;

const styles = StyleSheet.create({
    panel: {
        width: "100%",
        top: 0,
        backgroundColor: "white",
        position: "absolute",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowOffset: {width: 0, height: -2},
        shadowRadius: 4,
        shadowColor: 'black',
        shadowOpacity: 0.10,

    },
    priceBlock: {
        paddingBottom: 20,
    },
    detailBlock: {
        maxHeight: windowHeight / 100 * 60
    },
    moveAnchor: {
        backgroundColor: "#4464EC",
        alignSelf: 'center',
        opacity: 0.4,
        width: 40,
        height: 5,
        borderRadius: 4
    },
    elementMargin: {
        marginBottom: 8,
    },
    totalPriceArea: {
        flex: 1,
        marginTop: 28,
        marginLeft: 24,
        flexWrap: 'wrap',
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    priceContainer: {
        width: "auto",
        marginRight: 24,
        marginTop: 4,
        alignItems: "flex-end"
    },
    totalText: {
        fontSize: 14,
        lineHeight: 16,
        fontWeight: "bold",
        color: "black"
    },
    priceText: {
        marginTop: 8,
        fontSize: 24,
        fontWeight: "bold",
        letterSpacing: 1.5,
        color: "#4464EC"
    },
    sectionHeader: {
        height: 70,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    sectionFooter: {
        height: 30,
        marginBottom: -20
    },
    sectionHeaderText: {
        fontSize: 24,
        color: "white",
        fontWeight: "bold",
    },
    sectionItem: {
        height: 52,
        backgroundColor: "white",
        borderRadius: 10
    },
    item: {
        paddingBottom: 8
    },
    priceLostText: {
        fontSize: 14,
        lineHeight: 17,
        fontWeight: "600",
        color: "red",
    }
});
