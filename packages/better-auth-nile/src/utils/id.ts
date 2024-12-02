import { v4 as uuidv4 } from 'uuid';

export const generateId = (size?: number) => {
	return uuidv4();
};