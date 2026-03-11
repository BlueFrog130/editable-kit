import { describe, it, expect } from 'vitest';
import { restrictPosition, computeCroppedArea, getDistanceBetweenPoints, getCenter } from './util.js';

describe('restrictPosition', () => {
	const image = { width: 200, height: 100 };
	const crop = { width: 100, height: 100 };

	it('clamps positive overflow at zoom=1', () => {
		const result = restrictPosition({ x: 999, y: 999 }, image, crop, 1);
		expect(result.x).toBeLessThanOrEqual((200 - 100) / 2);
		expect(result.y).toBeLessThanOrEqual(0);
	});

	it('clamps negative overflow at zoom=1', () => {
		const result = restrictPosition({ x: -999, y: -999 }, image, crop, 1);
		expect(result.x).toBeGreaterThanOrEqual(-(200 - 100) / 2);
		expect(result.y).toBeGreaterThanOrEqual(0);
	});

	it('allows no movement when image equals crop size', () => {
		const square = { width: 100, height: 100 };
		const result = restrictPosition({ x: 50, y: 50 }, square, square, 1);
		expect(result.x).toBe(0);
		expect(result.y).toBe(0);
	});

	it('centers image when smaller than crop area', () => {
		const small = { width: 50, height: 50 };
		const big = { width: 200, height: 200 };
		const result = restrictPosition({ x: 999, y: 999 }, small, big, 1);
		expect(result.x).toBe(75);
		expect(result.y).toBe(75);
	});

	it('expands allowed range at high zoom', () => {
		const result = restrictPosition({ x: 100, y: 0 }, image, crop, 3);
		expect(result.x).toBe(100);
	});

	it('handles zero-size crop without NaN', () => {
		const zeroCrop = { width: 0, height: 0 };
		const result = restrictPosition({ x: 10, y: 10 }, image, zeroCrop, 1);
		expect(Number.isFinite(result.x)).toBe(true);
		expect(Number.isFinite(result.y)).toBe(true);
	});

	it('handles zero-size image', () => {
		const zeroImg = { width: 0, height: 0 };
		const result = restrictPosition({ x: 10, y: 10 }, zeroImg, crop, 1);
		expect(result.x).toBe(50);
		expect(result.y).toBe(50);
	});
});

describe('getDistanceBetweenPoints', () => {
	it('computes 3-4-5 triangle hypotenuse', () => {
		expect(getDistanceBetweenPoints({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
	});

	it('returns 0 for same point', () => {
		expect(getDistanceBetweenPoints({ x: 7, y: 7 }, { x: 7, y: 7 })).toBe(0);
	});

	it('works with negative coordinates', () => {
		const d = getDistanceBetweenPoints({ x: -1, y: -1 }, { x: -4, y: -5 });
		expect(d).toBe(5);
	});
});

describe('getCenter', () => {
	it('computes midpoint of two points', () => {
		expect(getCenter({ x: 0, y: 0 }, { x: 10, y: 20 })).toEqual({ x: 5, y: 10 });
	});

	it('returns same point when both inputs are equal', () => {
		expect(getCenter({ x: 3, y: 7 }, { x: 3, y: 7 })).toEqual({ x: 3, y: 7 });
	});
});

describe('computeCroppedArea', () => {
	const imgSize = { width: 100, height: 100, naturalWidth: 200, naturalHeight: 200 };
	const cropSize = { width: 100, height: 100 };

	describe('restricted path', () => {
		it('returns full image at zoom=1, crop at origin', () => {
			const { croppedAreaPixels, croppedAreaPercentages } = computeCroppedArea(
				{ x: 0, y: 0 }, imgSize, cropSize, 1, 1, true
			);
			expect(croppedAreaPercentages.width).toBeCloseTo(100);
			expect(croppedAreaPercentages.height).toBeCloseTo(100);
			expect(croppedAreaPixels.width).toBe(200);
			expect(croppedAreaPixels.height).toBe(200);
			expect(croppedAreaPixels.x).toBe(0);
			expect(croppedAreaPixels.y).toBe(0);
		});

		it('returns smaller region when zoomed in', () => {
			const { croppedAreaPercentages } = computeCroppedArea(
				{ x: 0, y: 0 }, imgSize, cropSize, 1, 2, true
			);
			expect(croppedAreaPercentages.width).toBeCloseTo(50);
			expect(croppedAreaPercentages.height).toBeCloseTo(50);
		});

		it('clamps percentages to 0-100 range', () => {
			const { croppedAreaPercentages } = computeCroppedArea(
				{ x: 9999, y: 9999 }, imgSize, cropSize, 1, 1, true
			);
			expect(croppedAreaPercentages.x).toBeGreaterThanOrEqual(0);
			expect(croppedAreaPercentages.x).toBeLessThanOrEqual(100);
			expect(croppedAreaPercentages.y).toBeGreaterThanOrEqual(0);
			expect(croppedAreaPercentages.y).toBeLessThanOrEqual(100);
		});
	});

	describe('unrestricted path', () => {
		it('allows percentages outside 0-100', () => {
			const { croppedAreaPercentages } = computeCroppedArea(
				{ x: 9999, y: 9999 }, imgSize, cropSize, 1, 1, false
			);
			expect(croppedAreaPercentages.x).toBeLessThan(0);
		});
	});

	describe('aspect ratio branches', () => {
		it('handles wider-than-high image (width >= height * aspect)', () => {
			const wide = { width: 200, height: 100, naturalWidth: 400, naturalHeight: 200 };
			const { croppedAreaPixels } = computeCroppedArea(
				{ x: 0, y: 0 }, wide, { width: 200, height: 100 }, 2, 1, true
			);
			expect(croppedAreaPixels.height).toBe(200);
			expect(croppedAreaPixels.width).toBe(200 * 2);
		});

		it('handles taller-than-wide image', () => {
			const tall = { width: 100, height: 200, naturalWidth: 200, naturalHeight: 400 };
			const { croppedAreaPixels } = computeCroppedArea(
				{ x: 0, y: 0 }, tall, { width: 100, height: 200 }, 0.5, 1, true
			);
			expect(croppedAreaPixels.width).toBeGreaterThan(0);
			expect(croppedAreaPixels.height).toBeGreaterThan(0);
		});

		it('hits taller-than-wide branch', () => {
			const tall = { width: 50, height: 200, naturalWidth: 100, naturalHeight: 400 };
			const { croppedAreaPixels } = computeCroppedArea(
				{ x: 0, y: 0 }, tall, { width: 50, height: 200 }, 1, 1, true
			);
			expect(croppedAreaPixels.width).toBe(100);
			expect(croppedAreaPixels.height).toBe(Math.round(100 / 1));
		});
	});

	describe('boundary conditions', () => {
		it('does not produce NaN with zero-dimension image', () => {
			const zero = { width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 };
			const { croppedAreaPixels } = computeCroppedArea(
				{ x: 0, y: 0 }, zero, cropSize, 1, 1, true
			);
			expect(Number.isNaN(croppedAreaPixels.width)).toBe(false);
			expect(Number.isNaN(croppedAreaPixels.height)).toBe(false);
		});
	});
});
