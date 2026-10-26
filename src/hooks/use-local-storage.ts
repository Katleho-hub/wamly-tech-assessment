import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'

export type LocalStorageSchema = {
  cartId: number | null
}

export type LocalStorageKey = keyof LocalStorageSchema

function readValue<K extends LocalStorageKey>(
  key: K,
  initialValue: LocalStorageSchema[K],
): LocalStorageSchema[K] {
  try {
    const stored = localStorage.getItem(key)

    return stored == null
      ? initialValue
      : (JSON.parse(stored) as LocalStorageSchema[K])
  } catch {
    return initialValue
  }
}

export function useLocalStorage<K extends LocalStorageKey>(
  key: K,
  initialValue: LocalStorageSchema[K],
): [LocalStorageSchema[K], Dispatch<SetStateAction<LocalStorageSchema[K]>>] {
  const [value, setValue] = useState(() => readValue(key, initialValue))

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Unable to persist ${key} to localStorage`, error)
    }
  }, [key, value])

  return [value, setValue]
}
