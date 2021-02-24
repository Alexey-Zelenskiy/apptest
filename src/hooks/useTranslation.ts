import {useContext} from "react";
import {MessagesContext} from "../../App";

const useTranslation = () => {
    const messages = useContext(MessagesContext);

    const formatMessage = ({id}: { id: string }) => {
        return messages[id];
    };

    return {formatMessage}
};

export default useTranslation
