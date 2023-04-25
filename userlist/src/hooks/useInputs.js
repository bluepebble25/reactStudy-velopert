import { useState, useCallback } from 'react';

/**
 *
 * @param {any} initialForm form 초기값
 * @returns input state, onChange 함수, onReset 함수
 */
function useInputs(initialForm) {
  const [form, setForm] = useState(initialForm);

  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((form) => ({
      ...form,
      [name]: value,
    }));
  }, []);

  const onReset = useCallback(() => {
    setForm(initialForm);
  }, [initialForm]);

  return [form, onChange, onReset];
}

export default useInputs;
