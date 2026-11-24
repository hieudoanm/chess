import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsTemplate } from '../SettingsTemplate';

describe('SettingsTemplate', () => {
  const handlers = {
    onLanguageChange: jest.fn(),
    onThemeChange: jest.fn(),
    onDateTimeFormatChange: jest.fn(),
    onTimezoneChange: jest.fn(),
  };

  const renderTemplate = () =>
    render(
      <SettingsTemplate
        language="en"
        theme="dark"
        dateTimeFormat="24h"
        timezone="UTC"
        {...handlers}
      />
    );

  it('renders the settings sections and current values', () => {
    renderTemplate();
    expect(
      screen.getByRole('heading', { name: 'Settings' })
    ).toBeInTheDocument();
    expect(screen.getByText('Customize your experience')).toBeInTheDocument();
    expect(screen.getAllByText('Language').length).toBeGreaterThan(0);
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Date/Time Format')).toBeInTheDocument();
    expect(screen.getByText('Timezone')).toBeInTheDocument();
    const combos = screen.getAllByRole('combobox');
    expect(combos).toHaveLength(4);
    expect(combos[0]).toHaveValue('en');
    expect(combos[1]).toHaveValue('dark');
    expect(combos[2]).toHaveValue('24h');
    expect(combos[3]).toHaveValue('UTC');
  });

  it('fires handlers when selects change', () => {
    renderTemplate();
    const [language, theme, dateTime, timezone] =
      screen.getAllByRole('combobox');

    fireEvent.change(language, { target: { value: 'vi' } });
    expect(handlers.onLanguageChange).toHaveBeenCalledWith('vi');

    fireEvent.change(theme, { target: { value: 'light' } });
    expect(handlers.onThemeChange).toHaveBeenCalledWith('light');

    fireEvent.change(dateTime, { target: { value: '12h' } });
    expect(handlers.onDateTimeFormatChange).toHaveBeenCalledWith('12h');

    fireEvent.change(timezone, { target: { value: 'Asia/Tokyo' } });
    expect(handlers.onTimezoneChange).toHaveBeenCalledWith('Asia/Tokyo');
  });
});
