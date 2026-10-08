import { describe, test } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import { getAvailableSkills, getDefaultSkillCommands } from './mock-data';

describe('local skill activation', () => {
  test('draft release review is excluded until activated', () => {
    const enabled = getDefaultSkillCommands();
    deepStrictEqual(getAvailableSkills(enabled, 'release'), []);
    deepStrictEqual(getAvailableSkills([...enabled, '/release-review'], 'release').map(skill => skill.command), ['/release-review']);
  });
  test('disabled goal skill is excluded from slash results', () => {
    deepStrictEqual(getAvailableSkills(getDefaultSkillCommands(), 'goal').map(skill => skill.command), ['/goal']);
    deepStrictEqual(getAvailableSkills(getDefaultSkillCommands().filter(command => command !== '/goal'), 'goal'), []);
  });
});