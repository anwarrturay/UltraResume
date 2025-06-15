import { useState } from 'react';
import { Plus, X } from 'lucide-react';

const Languages = ({ formData, setFormData}) => {
  const [newLanguage, setNewLanguage] = useState('');
  const [proficiency, setProficiency] = useState('Beginner');

  const proficiencyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Native/Fluent'];

  const handleAddLanguage = () => {
    if (newLanguage.trim()) {
      setFormData({
        ...formData,
        languages: [...formData.languages, { name: newLanguage.trim(), level: proficiency }]
      });
      setNewLanguage('');
      setProficiency('Beginner');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLanguage();
    }
  };

  const removeLanguage = (indexToRemove) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter((_, index) => index !== indexToRemove)
    });
  };

  return (
    <div className="space-y-6 font-Montserrat">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Languages Spoken</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="language-input" className="block text-sm font-medium text-gray-700">
                Language
              </label>
              <input
                id="language-input"
                type="text"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="resume-field"
                placeholder="Enter a language (e.g., English, Spanish)"
              />
            </div>

            <div>
              <label htmlFor="proficiency-select" className="block text-sm font-medium text-gray-700">
                Proficiency Level
              </label>
              <select
                id="proficiency-select"
                value={proficiency}
                onChange={(e) => setProficiency(e.target.value)}
                className="resume-field"
              >
                {proficiencyLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddLanguage}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2A5D9E] hover:bg-[#2A5D9E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus size={20} strokeWidth={3} className='mr-2'/>
              Add Language
            </button>
          </div>

          {formData && (
            formData.languages.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Your Languages</h3>
                <div className="space-y-2">
                  {formData.languages.map((lang, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white rounded-lg p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-900">{lang.name}</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {lang.level}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLanguage(index)}
                        className="text-gray-400 hover:text-red-500 focus:outline-none"
                      >
                        <X size={20} strokeWidth={3} className='mr-2'/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
          {formData.languages.length === 0 && (
            <p className="text-sm text-gray-500 text-center bg-gray-50 rounded-lg p-4">
              No languages added yet. Start adding your language proficiencies above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Languages;
