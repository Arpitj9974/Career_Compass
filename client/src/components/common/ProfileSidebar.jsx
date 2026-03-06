import { useState } from 'react';
import { useCareerStore } from '../../context/careerStore';

const INTERESTS_OPTIONS = [
    'Technology', 'Programming', 'Problem Solving', 'Science', 'Mathematics',
    'Business', 'Finance', 'Marketing', 'Communication', 'Leadership',
    'Healthcare', 'Medicine', 'Research', 'Writing', 'Design',
    'Arts', 'Music', 'Sports', 'Teaching', 'Social Work'
];

const SKILLS_OPTIONS = [
    'Mathematics', 'Logic', 'Coding', 'English', 'Communication',
    'Drawing', 'Creativity', 'Teamwork', 'Research', 'Analysis',
    'Public Speaking', 'Writing', 'Problem Solving', 'Critical Thinking'
];

const STREAMS = ['Science', 'Commerce', 'Arts'];
const EDUCATION_LEVELS = ['10th', '12th', 'Graduate', 'Post-Graduate'];

/**
 * Profile Sidebar Component
 * Allows students to edit their profile for personalized recommendations
 */
export default function ProfileSidebar({ isOpen, onClose }) {
    const { studentProfile, updateProfile } = useCareerStore();
    const [localProfile, setLocalProfile] = useState(studentProfile);

    const handleChange = (field, value) => {
        setLocalProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleMarksChange = (subject, value) => {
        setLocalProfile(prev => ({
            ...prev,
            marks: { ...prev.marks, [subject]: parseInt(value) || 0 }
        }));
    };

    const handleArrayToggle = (field, value) => {
        setLocalProfile(prev => {
            const current = prev[field] || [];
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return { ...prev, [field]: updated };
        });
    };

    const handleSave = () => {
        updateProfile(localProfile);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-30"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className="fixed right-0 top-0 h-full w-96 max-w-full z-40 
                bg-[var(--bg-secondary)] border-l border-gray-800 
                overflow-y-auto shadow-2xl animate-slide-in-right">

                {/* Header */}
                <div className="sticky top-0 bg-[var(--bg-secondary)] border-b border-gray-800 p-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Your Profile</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-4 space-y-6">
                    {/* Education Level */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Education Level
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {EDUCATION_LEVELS.map(level => (
                                <button
                                    key={level}
                                    onClick={() => handleChange('education_level', level)}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${localProfile.education_level === level
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stream */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Stream
                        </label>
                        <div className="flex gap-2">
                            {STREAMS.map(stream => (
                                <button
                                    key={stream}
                                    onClick={() => handleChange('stream', stream)}
                                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${localProfile.stream === stream
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        }`}
                                >
                                    {stream}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Marks */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Subject Marks (%)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {['maths', 'physics', 'chemistry', 'biology', 'english'].map(subject => (
                                <div key={subject}>
                                    <label className="block text-xs text-gray-500 mb-1 capitalize">
                                        {subject}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={localProfile.marks?.[subject] || ''}
                                        onChange={(e) => handleMarksChange(subject, e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 
                                            rounded-lg text-white text-sm
                                            focus:outline-none focus:border-indigo-500"
                                        placeholder="0-100"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Budget Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Budget Range (₹)
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                value={localProfile.budget_min || ''}
                                onChange={(e) => handleChange('budget_min', parseInt(e.target.value) || 0)}
                                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 
                                    rounded-lg text-white text-sm
                                    focus:outline-none focus:border-indigo-500"
                                placeholder="Min"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                                type="number"
                                value={localProfile.budget_max || ''}
                                onChange={(e) => handleChange('budget_max', parseInt(e.target.value) || 0)}
                                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 
                                    rounded-lg text-white text-sm
                                    focus:outline-none focus:border-indigo-500"
                                placeholder="Max"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Current: ₹{((localProfile.budget_min || 0) / 100000).toFixed(1)}L - ₹{((localProfile.budget_max || 0) / 100000).toFixed(1)}L
                        </p>
                    </div>

                    {/* Interests */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Interests
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {INTERESTS_OPTIONS.map(interest => (
                                <button
                                    key={interest}
                                    onClick={() => handleArrayToggle('interests', interest)}
                                    className={`px-2.5 py-1 rounded-full text-xs transition-colors ${localProfile.interests?.includes(interest)
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                        }`}
                                >
                                    {interest}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Skills */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Skills
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {SKILLS_OPTIONS.map(skill => (
                                <button
                                    key={skill}
                                    onClick={() => handleArrayToggle('skills', skill)}
                                    className={`px-2.5 py-1 rounded-full text-xs transition-colors ${localProfile.skills?.includes(skill)
                                        ? 'bg-cyan-600 text-white'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                        }`}
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer with save button */}
                <div className="sticky bottom-0 bg-[var(--bg-secondary)] border-t border-gray-800 p-4">
                    <button
                        onClick={handleSave}
                        className="w-full btn-primary py-3"
                    >
                        Save & Apply
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                        Changes will update node recommendations
                    </p>
                </div>
            </div>
        </>
    );
}
