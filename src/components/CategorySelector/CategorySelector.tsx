import React from 'react';

const categories = [
    { name: "All", emoji: "🐶" },
    { name: "Js", emoji: "📒" },
    { name: "Ts", emoji: "📘" },
    { name: "React", emoji: "🛠️" },
    { name: "CS", emoji: "💾" },
];

interface CategorySelectorProps {
    switchCategory: (selectCategory: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ switchCategory }) => {
    return (
        <nav className="flex flex-wrap gap-2 pt-10">
            {categories.map((category, idx) => (
                <button
                    className="border-2 border-solid border-slate-950 rounded-xl py-1 px-3 flex items-center text-center text-lg dark:border-white"
                    key={idx}
                    onClick={() => switchCategory(category.name)}
                >
                    {category.emoji} {category.name}
                </button>
            ))}
        </nav>
    );
};

export default CategorySelector;
