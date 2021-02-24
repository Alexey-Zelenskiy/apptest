interface UserColor {
    [key: number]: string;

    getColor: (index: number) => string
}

export const usersColor: UserColor = {
    0: "#FFBF00",
    1: "#7265E6",
    2: "#2BC3D1",
    3: "#F56A00",
    4: "#4464EC",
    5: "#EB5757",
    6: "#27AE60",
    7: "#FF1D76",
    getColor(index: number): string {
        if (index < 8) return this[index] as string;
        return this[index % 8] as string;
    }
};

export const bgColor = "#f8f6f8";

export const bgSelectColor = "#dae0fb";
export const bgUnSelectColor = "#f0f0f1";

export const iconUnselectColor = "#8c8c8c";
export const iconSelectColor = "#4564ec";

export const selectedText = "#4464EC";
export const unSelectedText = "rgba(0, 0, 0, 0.7)";

export const likeColor = "#27AE60";
export const dislikeColor = "#FF473D";
export const notSetColor = "#b5b5ba";
