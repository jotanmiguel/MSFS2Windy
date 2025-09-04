// tests/unit/aircraftUtils.test.ts
import { describe, expect, test } from 'vitest';
import { addTrackById, removeTrackById } from '../../src/utils/aircraftUtils';

describe('Aircraft utils', () => {
    test('addTrackById adds new id only once', () => {
        const trackedIds: string[] = [];
        addTrackById(trackedIds, '12345');
        addTrackById(trackedIds, '12345');
        expect(trackedIds).toEqual(['12345']);
    });

    test('removeTrackById removes marker and trackedId', () => {
        const markers = [{ id: '1', aircraft: { callsign: 'ABC' } }] as any[];
        const trackedIds = ['1', 'ABC'];
        const { newMarkers, newTrackedIds } = removeTrackById(markers, trackedIds, '1') || {};

        expect(newMarkers).toEqual([]);
        expect(newTrackedIds).toEqual([]);
    });

    test('removeTrackById does nothing if id not found', () => {
        const markers = [{ id: '1', aircraft: { callsign: 'ABC' } }] as any[];
        const trackedIds = ['1', 'ABC'];
        const { newMarkers, newTrackedIds } = removeTrackById(markers, trackedIds, '2') || {};

        expect(newMarkers).toBeUndefined();
        expect(newTrackedIds).toBeUndefined();
    });
});
