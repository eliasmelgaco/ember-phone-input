import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, typeIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | phone-input', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    await this.owner.lookup('service:phone-input').load();
  });

  test('renders an input of type tel', async function(assert) {
    assert.expect(1);

    await render(hbs`{{phone-input number='1111'}}`);

    assert.dom('input').hasAttribute('type', 'tel');
  });

  test('renders the value', async function(assert) {
    assert.expect(4);

    const newValue = '2';
    this.set('number', null);
    this.set('update', value => assert.equal(value, null));

    await render(
      hbs`<PhoneInput @number={{this.number}} @update={{this.update}} />`
    );

    assert.dom('input').hasValue('');

    this.set('update', value => {
      assert.equal(value, newValue);
      this.set('number', newValue);
    });

    await typeIn('input', newValue);

    assert.dom('input').hasValue(newValue);
  });

  test('renders the value with separate dial code option', async function(assert) {
    assert.expect(4);

    const newValue = '2';

    this.set('separateDialNumber', null);

    this.set('update', value => {
      if (value) {
        assert.equal(value, '+12');
      }

      this.set('separateDialNumber', value);
    });

    await render(
      hbs`<PhoneInput @separateDialCode={{true}} @number={{this.separateDialNumber}} @update={{action this.update}} />`
    );

    assert.dom('input').hasValue('');
    assert.dom('.iti__selected-dial-code').hasText('+1');

    await typeIn('input', newValue);

    assert.dom('input').hasValue(newValue);
  });

  test('can update the country', async function(assert) {
    assert.expect(4);

    const country = 'us';
    this.set('number', null);
    this.set('update', value => assert.equal(value, null));
    this.set('country', country);

    await render(
      hbs`<PhoneInput @country={{this.country}} @number={{this.number}} @update={{action this.update}} />`
    );

    assert.dom('.iti__flag').hasClass('iti__us');

    this.set('update', value => assert.equal(value, ''));

    this.set('country', 'nz');

    assert.dom('.iti__flag').hasClass('iti__nz');
  });

  test('phoneNumber is correctly invalid when country is changed', async function(assert) {
    assert.expect(8);

    const country = 'fr';
    const validFrenchNumber = '0622334455';
    this.set('number', null);
    this.set('country', country);
    this.set('update', value => assert.equal(value, null));

    await render(
      hbs`<PhoneInput @country={{this.country}} @number={{this.number}} @update={{action this.update}} />`
    );

    let actualPosition = 0;

    this.set('update', (_, { isValidNumber, numberFormat }) => {
      if (actualPosition === validFrenchNumber.length - 1) {
        assert.ok(isValidNumber);
        assert.equal(numberFormat.E164, '+33622334455');
        assert.equal(numberFormat.INTERNATIONAL, '+33 6 22 33 44 55');
        assert.equal(numberFormat.NATIONAL, '06 22 33 44 55');
        assert.equal(numberFormat.RFC3966, 'tel:+33-6-22-33-44-55');
      }
      actualPosition += 1;
    });

    await typeIn('input', validFrenchNumber);

    this.set('update', (number, { isValidNumber, numberFormat }) => {
      assert.notOk(isValidNumber);
      assert.equal(numberFormat, null);
    });

    this.set('country', 'pt');
  });

  test('can be disabled', async function(assert) {
    assert.expect(4);

    this.set('number', null);
    this.set('update', value => assert.equal(value, null));

    await render(
      hbs`<PhoneInput @number={{this.number}} @update={{action this.update}} />`
    );

    assert.notOk(find('input').disabled);

    await render(
      hbs`<PhoneInput @disabled={{true}} @number={{this.number}} @update={{action this.update}} />`
    );

    assert.ok(find('input').disabled);
  });

  test('can be required', async function(assert) {
    assert.expect(2);

    this.set('number', null);

    await render(hbs`<PhoneInput @number={{this.number}} />`);

    assert.notOk(find('input').required);

    await render(
      hbs`<PhoneInput @required={{true}} @number={{this.number}} />`
    );

    assert.ok(find('input').required);
  });

  test('can prevent the dropdown', async function(assert) {
    assert.expect(2);

    this.set('updateAllowDropdownNumber', value => assert.equal(value, null));

    await render(
      hbs`<PhoneInput @allowDropdown={{false}} @update={{action this.updateAllowDropdownNumber}} />`
    );

    assert.dom('ul.country-list').doesNotExist();
  });

  test('can set autocomplete', async function(assert) {
    await render(hbs`<PhoneInput @autocomplete={{"tel"}} />`);

    assert.equal(find('input').autocomplete, 'tel');
  });

  test('can update the country when the user types in the digits from Brazil code', async function(assert) {
    assert.expect(5);

    const code = '+55';

    let slicePosition = 1;

    this.set('update', value => {
      if (value) {
        assert.equal(code.slice(0, slicePosition), value);

        slicePosition += 1;
      }
    });

    await render(hbs`<PhoneInput @update={{action this.update}} />`);

    await typeIn('input', code);

    assert.dom('.iti__flag').hasClass('iti__br');
  });

  test('can update the country when the user types in the digits from Malaysia code', async function(assert) {
    assert.expect(5);

    const code = '+60';

    let slicePosition = 1;

    this.set('update', value => {
      if (value) {
        assert.equal(code.slice(0, slicePosition), value);

        slicePosition += 1;
      }
    });

    await render(hbs`<PhoneInput @update={{action this.update}} />`);

    await typeIn('input', code);

    assert.dom('.iti__flag').hasClass('iti__my');
  });
});
