import React from 'react';

const category = ["All", "Js", "Ts", "React"];
const emoji = ["🐶", "📒", "📘", "🛠️"]

interface CategorySelectorProps {
    switchCategory: (selectCategory: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ switchCategory }) => {
    return (
        <nav className="flex gap-2 pt-10">
            {category.map((curCategory, idx) => (
                <button
                    className="border-2 border-solid border-slate-950 rounded-xl py-1 px-3 flex items-center text-center text-lg"
                    key={idx}
                    onClick={() => switchCategory(curCategory)}
                >
                    {emoji[idx]} {curCategory}
                </button>
            ))}
        </nav>
    );
};

export default CategorySelector;
