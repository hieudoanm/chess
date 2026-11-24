# TREE

```text
├── docs/
│   ├── [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
│   ├── [CONTRIBUTING.md](./docs/CONTRIBUTING.md)
│   ├── [DOWNLOADS.md](./docs/DOWNLOADS.md)
│   ├── [PACKAGING.md](./docs/PACKAGING.md)
│   └── [ROADMAP.md](./docs/ROADMAP.md)
├── e2e/
│   ├── [about.spec.ts](./e2e/about.spec.ts)
│   ├── [bracket.spec.ts](./e2e/bracket.spec.ts)
│   ├── [create.spec.ts](./e2e/create.spec.ts)
│   ├── [dashboard.spec.ts](./e2e/dashboard.spec.ts)
│   ├── [matches.spec.ts](./e2e/matches.spec.ts)
│   ├── [navigation.spec.ts](./e2e/navigation.spec.ts)
│   ├── [participants.spec.ts](./e2e/participants.spec.ts)
│   ├── [profile.spec.ts](./e2e/profile.spec.ts)
│   ├── [settings.spec.ts](./e2e/settings.spec.ts)
│   ├── [standings.spec.ts](./e2e/standings.spec.ts)
│   ├── [tournament-detail.spec.ts](./e2e/tournament-detail.spec.ts)
│   └── [version.spec.ts](./e2e/version.spec.ts)
├── public/
│   ├── icons/
│   │   ├── [icon-128x128.png](./public/icons/icon-128x128.png)
│   │   ├── [icon-144x144.png](./public/icons/icon-144x144.png)
│   │   ├── [icon-152x152.png](./public/icons/icon-152x152.png)
│   │   ├── [icon-16x16.png](./public/icons/icon-16x16.png)
│   │   ├── [icon-180x180.png](./public/icons/icon-180x180.png)
│   │   ├── [icon-192x192.png](./public/icons/icon-192x192.png)
│   │   ├── [icon-256x256.png](./public/icons/icon-256x256.png)
│   │   ├── [icon-32x32.png](./public/icons/icon-32x32.png)
│   │   ├── [icon-384x384.png](./public/icons/icon-384x384.png)
│   │   ├── [icon-48x48.png](./public/icons/icon-48x48.png)
│   │   ├── [icon-512x512.png](./public/icons/icon-512x512.png)
│   │   ├── [icon-64x64.png](./public/icons/icon-64x64.png)
│   │   ├── [icon-72x72.png](./public/icons/icon-72x72.png)
│   │   ├── [icon-96x96.png](./public/icons/icon-96x96.png)
│   │   └── [icon.svg](./public/icons/icon.svg)
│   ├── [apple-touch-icon.png](./public/apple-touch-icon.png)
│   ├── [favicon.ico](./public/favicon.ico)
│   ├── [manifest.json](./public/manifest.json)
│   ├── [robots.txt](./public/robots.txt)
│   ├── [sitemap.xml](./public/sitemap.xml)
│   └── [sw.js](./public/sw.js)
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── forget-password/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── [page.test.tsx](./src/app/(auth)/forget-password/__tests__/page.test.tsx)
│   │   │   │   └── [page.tsx](./src/app/(auth)/forget-password/page.tsx)
│   │   │   ├── profile/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── [page.test.tsx](./src/app/(auth)/profile/__tests__/page.test.tsx)
│   │   │   │   └── [page.tsx](./src/app/(auth)/profile/page.tsx)
│   │   │   ├── reset-password/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── [page.test.tsx](./src/app/(auth)/reset-password/__tests__/page.test.tsx)
│   │   │   │   └── [page.tsx](./src/app/(auth)/reset-password/page.tsx)
│   │   │   ├── sign-in/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── [page.test.tsx](./src/app/(auth)/sign-in/__tests__/page.test.tsx)
│   │   │   │   └── [page.tsx](./src/app/(auth)/sign-in/page.tsx)
│   │   │   └── sign-up/
│   │   │       ├── __tests__/
│   │   │       │   └── [page.test.tsx](./src/app/(auth)/sign-up/__tests__/page.test.tsx)
│   │   │       └── [page.tsx](./src/app/(auth)/sign-up/page.tsx)
│   │   ├── (dashboard)/
│   │   │   ├── __tests__/
│   │   │   │   └── [page.test.tsx](./src/app/(dashboard)/__tests__/page.test.tsx)
│   │   │   └── [page.tsx](./src/app/(dashboard)/page.tsx)
│   │   ├── (info)/
│   │   │   ├── about/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── [page.test.tsx](./src/app/(info)/about/__tests__/page.test.tsx)
│   │   │   │   └── [page.tsx](./src/app/(info)/about/page.tsx)
│   │   │   ├── downloads/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── [page.test.tsx](./src/app/(info)/downloads/__tests__/page.test.tsx)
│   │   │   │   └── [page.tsx](./src/app/(info)/downloads/page.tsx)
│   │   │   └── version/
│   │   │       ├── __tests__/
│   │   │       │   └── [page.test.tsx](./src/app/(info)/version/__tests__/page.test.tsx)
│   │   │       └── [page.tsx](./src/app/(info)/version/page.tsx)
│   │   ├── (tournament)/
│   │   │   ├── bracket/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── [page.test.tsx](./src/app/(tournament)/bracket/__tests__/page.test.tsx)
│   │   │   │   └── [page.tsx](./src/app/(tournament)/bracket/page.tsx)
│   │   │   ├── create/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── [page.test.tsx](./src/app/(tournament)/create/__tests__/page.test.tsx)
│   │   │   │   └── [page.tsx](./src/app/(tournament)/create/page.tsx)
│   │   │   ├── match/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── [page.test.tsx](./src/app/(tournament)/match/__tests__/page.test.tsx)
│   │   │   │   └── [page.tsx](./src/app/(tournament)/match/page.tsx)
│   │   │   ├── matches/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── [page.test.tsx](./src/app/(tournament)/matches/__tests__/page.test.tsx)
│   │   │   │   └── [page.tsx](./src/app/(tournament)/matches/page.tsx)
│   │   │   ├── participants/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── [page.test.tsx](./src/app/(tournament)/participants/__tests__/page.test.tsx)
│   │   │   │   └── [page.tsx](./src/app/(tournament)/participants/page.tsx)
│   │   │   ├── standings/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── [page.test.tsx](./src/app/(tournament)/standings/__tests__/page.test.tsx)
│   │   │   │   └── [page.tsx](./src/app/(tournament)/standings/page.tsx)
│   │   │   └── tournament/
│   │   │       ├── __tests__/
│   │   │       │   └── [page.test.tsx](./src/app/(tournament)/tournament/__tests__/page.test.tsx)
│   │   │       └── [page.tsx](./src/app/(tournament)/tournament/page.tsx)
│   │   ├── (user)/
│   │   │   └── settings/
│   │   │       ├── __tests__/
│   │   │       │   └── [page.test.tsx](./src/app/(user)/settings/__tests__/page.test.tsx)
│   │   │       └── [page.tsx](./src/app/(user)/settings/page.tsx)
│   │   ├── __tests__/
│   │   │   ├── [error.test.tsx](./src/app/__tests__/error.test.tsx)
│   │   │   ├── [forbidden.test.tsx](./src/app/__tests__/forbidden.test.tsx)
│   │   │   ├── [global-error.test.tsx](./src/app/__tests__/global-error.test.tsx)
│   │   │   ├── [layout.test.tsx](./src/app/__tests__/layout.test.tsx)
│   │   │   ├── [loading.test.tsx](./src/app/__tests__/loading.test.tsx)
│   │   │   ├── [not-found.test.tsx](./src/app/__tests__/not-found.test.tsx)
│   │   │   ├── [robots.test.ts](./src/app/__tests__/robots.test.ts)
│   │   │   ├── [template.test.tsx](./src/app/__tests__/template.test.tsx)
│   │   │   └── [unauthorized.test.tsx](./src/app/__tests__/unauthorized.test.tsx)
│   │   ├── [default.tsx](./src/app/default.tsx)
│   │   ├── [error.tsx](./src/app/error.tsx)
│   │   ├── [favicon.ico](./src/app/favicon.ico)
│   │   ├── [forbidden.tsx](./src/app/forbidden.tsx)
│   │   ├── [global-error.tsx](./src/app/global-error.tsx)
│   │   ├── [layout.tsx](./src/app/layout.tsx)
│   │   ├── [loading.tsx](./src/app/loading.tsx)
│   │   ├── [not-found.tsx](./src/app/not-found.tsx)
│   │   ├── [providers.tsx](./src/app/providers.tsx)
│   │   ├── [robots.ts](./src/app/robots.ts)
│   │   ├── [template.tsx](./src/app/template.tsx)
│   │   └── [unauthorized.tsx](./src/app/unauthorized.tsx)
│   ├── components/
│   │   ├── __tests__/
│   │   │   ├── [context-menu.test.tsx](./src/components/__tests__/context-menu.test.tsx)
│   │   │   ├── [export-modal.test.tsx](./src/components/__tests__/export-modal.test.tsx)
│   │   │   └── [set-editor.test.tsx](./src/components/__tests__/set-editor.test.tsx)
│   │   ├── atoms/
│   │   │   ├── __tests__/
│   │   │   │   └── [EmptyState.test.tsx](./src/components/atoms/__tests__/EmptyState.test.tsx)
│   │   │   ├── [ContextMenu.tsx](./src/components/atoms/ContextMenu.tsx)
│   │   │   └── [EmptyState.tsx](./src/components/atoms/EmptyState.tsx)
│   │   ├── molecules/
│   │   │   ├── __tests__/
│   │   │   │   ├── [FormatBadge.test.tsx](./src/components/molecules/__tests__/FormatBadge.test.tsx)
│   │   │   │   ├── [SearchBar.test.tsx](./src/components/molecules/__tests__/SearchBar.test.tsx)
│   │   │   │   ├── [StatusBadge.test.tsx](./src/components/molecules/__tests__/StatusBadge.test.tsx)
│   │   │   │   ├── [StatusFilter.test.tsx](./src/components/molecules/__tests__/StatusFilter.test.tsx)
│   │   │   │   ├── [TournamentCard.test.tsx](./src/components/molecules/__tests__/TournamentCard.test.tsx)
│   │   │   │   └── [TournamentList.test.tsx](./src/components/molecules/__tests__/TournamentList.test.tsx)
│   │   │   ├── [FormatBadge.tsx](./src/components/molecules/FormatBadge.tsx)
│   │   │   ├── [SearchBar.tsx](./src/components/molecules/SearchBar.tsx)
│   │   │   ├── [StatusBadge.tsx](./src/components/molecules/StatusBadge.tsx)
│   │   │   ├── [StatusFilter.tsx](./src/components/molecules/StatusFilter.tsx)
│   │   │   ├── [TournamentCard.tsx](./src/components/molecules/TournamentCard.tsx)
│   │   │   └── [TournamentList.tsx](./src/components/molecules/TournamentList.tsx)
│   │   ├── organisms/
│   │   │   ├── __tests__/
│   │   │   │   ├── [AnalyticsPanel.test.tsx](./src/components/organisms/__tests__/AnalyticsPanel.test.tsx)
│   │   │   │   ├── [BracketView.test.tsx](./src/components/organisms/__tests__/BracketView.test.tsx)
│   │   │   │   ├── [CalendarView.test.tsx](./src/components/organisms/__tests__/CalendarView.test.tsx)
│   │   │   │   ├── [Header.test.tsx](./src/components/organisms/__tests__/Header.test.tsx)
│   │   │   │   ├── [MatchCard.test.tsx](./src/components/organisms/__tests__/MatchCard.test.tsx)
│   │   │   │   ├── [ParticipantList.test.tsx](./src/components/organisms/__tests__/ParticipantList.test.tsx)
│   │   │   │   ├── [ShareModal.test.tsx](./src/components/organisms/__tests__/ShareModal.test.tsx)
│   │   │   │   ├── [StandingsTable.test.tsx](./src/components/organisms/__tests__/StandingsTable.test.tsx)
│   │   │   │   └── [ToastContainer.test.tsx](./src/components/organisms/__tests__/ToastContainer.test.tsx)
│   │   │   ├── [AnalyticsPanel.tsx](./src/components/organisms/AnalyticsPanel.tsx)
│   │   │   ├── [BracketView.tsx](./src/components/organisms/BracketView.tsx)
│   │   │   ├── [CalendarView.tsx](./src/components/organisms/CalendarView.tsx)
│   │   │   ├── [ExportModal.tsx](./src/components/organisms/ExportModal.tsx)
│   │   │   ├── [Header.tsx](./src/components/organisms/Header.tsx)
│   │   │   ├── [MatchCard.tsx](./src/components/organisms/MatchCard.tsx)
│   │   │   ├── [Navbar.tsx](./src/components/organisms/Navbar.tsx)
│   │   │   ├── [ParticipantList.tsx](./src/components/organisms/ParticipantList.tsx)
│   │   │   ├── [ShareModal.tsx](./src/components/organisms/ShareModal.tsx)
│   │   │   ├── [StandingsTable.tsx](./src/components/organisms/StandingsTable.tsx)
│   │   │   └── [ToastContainer.tsx](./src/components/organisms/ToastContainer.tsx)
│   │   ├── pages/
│   │   │   ├── __tests__/
│   │   │   │   ├── [AboutPage.test.tsx](./src/components/pages/__tests__/AboutPage.test.tsx)
│   │   │   │   ├── [DashboardPage.test.tsx](./src/components/pages/__tests__/DashboardPage.test.tsx)
│   │   │   │   └── [VersionPage.test.tsx](./src/components/pages/__tests__/VersionPage.test.tsx)
│   │   │   ├── bracket/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── [BracketPage.test.tsx](./src/components/pages/bracket/__tests__/BracketPage.test.tsx)
│   │   │   │   ├── [BracketCard.tsx](./src/components/pages/bracket/BracketCard.tsx)
│   │   │   │   └── [BracketPage.tsx](./src/components/pages/bracket/BracketPage.tsx)
│   │   │   ├── create/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── [CreatePage.test.tsx](./src/components/pages/create/__tests__/CreatePage.test.tsx)
│   │   │   │   ├── [CreatePage.tsx](./src/components/pages/create/CreatePage.tsx)
│   │   │   │   ├── [FormatSelector.tsx](./src/components/pages/create/FormatSelector.tsx)
│   │   │   │   └── [TiebreakerList.tsx](./src/components/pages/create/TiebreakerList.tsx)
│   │   │   ├── match-detail/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── [MatchDetailPage.test.tsx](./src/components/pages/match-detail/__tests__/MatchDetailPage.test.tsx)
│   │   │   │   ├── [MatchDetailPage.tsx](./src/components/pages/match-detail/MatchDetailPage.tsx)
│   │   │   │   ├── [MatchParticipants.tsx](./src/components/pages/match-detail/MatchParticipants.tsx)
│   │   │   │   ├── [PenaltyEditor.tsx](./src/components/pages/match-detail/PenaltyEditor.tsx)
│   │   │   │   ├── [ScoreEditor.tsx](./src/components/pages/match-detail/ScoreEditor.tsx)
│   │   │   │   ├── [SetEditor.tsx](./src/components/pages/match-detail/SetEditor.tsx)
│   │   │   │   ├── [WalkoverSelector.tsx](./src/components/pages/match-detail/WalkoverSelector.tsx)
│   │   │   │   └── [WinnerSelector.tsx](./src/components/pages/match-detail/WinnerSelector.tsx)
│   │   │   ├── matches/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── [MatchesPage.test.tsx](./src/components/pages/matches/__tests__/MatchesPage.test.tsx)
│   │   │   │   ├── [MatchListItem.tsx](./src/components/pages/matches/MatchListItem.tsx)
│   │   │   │   └── [MatchesPage.tsx](./src/components/pages/matches/MatchesPage.tsx)
│   │   │   ├── participants/
│   │   │   │   ├── __tests__/
│   │   │   │   │   ├── [GroupAssignment.test.tsx](./src/components/pages/participants/__tests__/GroupAssignment.test.tsx)
│   │   │   │   │   ├── [ParticipantList.test.tsx](./src/components/pages/participants/__tests__/ParticipantList.test.tsx)
│   │   │   │   │   ├── [ParticipantProfileModal.test.tsx](./src/components/pages/participants/__tests__/ParticipantProfileModal.test.tsx)
│   │   │   │   │   └── [ParticipantsPage.test.tsx](./src/components/pages/participants/__tests__/ParticipantsPage.test.tsx)
│   │   │   │   ├── [AddParticipantForm.tsx](./src/components/pages/participants/AddParticipantForm.tsx)
│   │   │   │   ├── [BatchAddForm.tsx](./src/components/pages/participants/BatchAddForm.tsx)
│   │   │   │   ├── [GroupAssignment.tsx](./src/components/pages/participants/GroupAssignment.tsx)
│   │   │   │   ├── [ParticipantList.tsx](./src/components/pages/participants/ParticipantList.tsx)
│   │   │   │   ├── [ParticipantProfileModal.tsx](./src/components/pages/participants/ParticipantProfileModal.tsx)
│   │   │   │   └── [ParticipantsPage.tsx](./src/components/pages/participants/ParticipantsPage.tsx)
│   │   │   ├── profile/
│   │   │   │   ├── __tests__/
│   │   │   │   │   ├── [Leaderboard.test.tsx](./src/components/pages/profile/__tests__/Leaderboard.test.tsx)
│   │   │   │   │   └── [ProfilePage.test.tsx](./src/components/pages/profile/__tests__/ProfilePage.test.tsx)
│   │   │   │   ├── [ActivityList.tsx](./src/components/pages/profile/ActivityList.tsx)
│   │   │   │   ├── [Leaderboard.tsx](./src/components/pages/profile/Leaderboard.tsx)
│   │   │   │   ├── [ProfilePage.tsx](./src/components/pages/profile/ProfilePage.tsx)
│   │   │   │   └── [StatsCard.tsx](./src/components/pages/profile/StatsCard.tsx)
│   │   │   ├── settings/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── [SettingsPage.test.tsx](./src/components/pages/settings/__tests__/SettingsPage.test.tsx)
│   │   │   │   ├── [SettingRow.tsx](./src/components/pages/settings/SettingRow.tsx)
│   │   │   │   ├── [SettingSection.tsx](./src/components/pages/settings/SettingSection.tsx)
│   │   │   │   └── [SettingsPage.tsx](./src/components/pages/settings/SettingsPage.tsx)
│   │   │   ├── standings/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── [StandingsPage.test.tsx](./src/components/pages/standings/__tests__/StandingsPage.test.tsx)
│   │   │   │   ├── [StandingsPage.tsx](./src/components/pages/standings/StandingsPage.tsx)
│   │   │   │   └── [StandingsTable.tsx](./src/components/pages/standings/StandingsTable.tsx)
│   │   │   ├── tournament/
│   │   │   │   ├── __tests__/
│   │   │   │   │   ├── [ParticipantsView.test.tsx](./src/components/pages/tournament/__tests__/ParticipantsView.test.tsx)
│   │   │   │   │   └── [TournamentDetailPage.test.tsx](./src/components/pages/tournament/__tests__/TournamentDetailPage.test.tsx)
│   │   │   │   ├── [BracketView.tsx](./src/components/pages/tournament/BracketView.tsx)
│   │   │   │   ├── [MatchCard.tsx](./src/components/pages/tournament/MatchCard.tsx)
│   │   │   │   ├── [MatchesView.tsx](./src/components/pages/tournament/MatchesView.tsx)
│   │   │   │   ├── [OverviewView.tsx](./src/components/pages/tournament/OverviewView.tsx)
│   │   │   │   ├── [ParticipantsView.tsx](./src/components/pages/tournament/ParticipantsView.tsx)
│   │   │   │   ├── [StandingsView.tsx](./src/components/pages/tournament/StandingsView.tsx)
│   │   │   │   ├── [TournamentDetailPage.tsx](./src/components/pages/tournament/TournamentDetailPage.tsx)
│   │   │   │   └── [constants.ts](./src/components/pages/tournament/constants.ts)
│   │   │   ├── [AboutPage.tsx](./src/components/pages/AboutPage.tsx)
│   │   │   ├── [DashboardPage.tsx](./src/components/pages/DashboardPage.tsx)
│   │   │   └── [VersionPage.tsx](./src/components/pages/VersionPage.tsx)
│   │   └── templates/
│   │       ├── __tests__/
│   │       │   ├── [AboutTemplate.test.tsx](./src/components/templates/__tests__/AboutTemplate.test.tsx)
│   │       │   ├── [DownloadsTemplate.test.tsx](./src/components/templates/__tests__/DownloadsTemplate.test.tsx)
│   │       │   ├── [ErrorTemplate.test.tsx](./src/components/templates/__tests__/ErrorTemplate.test.tsx)
│   │       │   ├── [SettingsTemplate.test.tsx](./src/components/templates/__tests__/SettingsTemplate.test.tsx)
│   │       │   └── [VersionTemplate.test.tsx](./src/components/templates/__tests__/VersionTemplate.test.tsx)
│   │       ├── [AboutTemplate.tsx](./src/components/templates/AboutTemplate.tsx)
│   │       ├── [DownloadsTemplate.tsx](./src/components/templates/DownloadsTemplate.tsx)
│   │       ├── [ErrorTemplate.tsx](./src/components/templates/ErrorTemplate.tsx)
│   │       ├── [SettingsTemplate.tsx](./src/components/templates/SettingsTemplate.tsx)
│   │       └── [VersionTemplate.tsx](./src/components/templates/VersionTemplate.tsx)
│   ├── data/
│   │   ├── __tests__/
│   │   │   └── [models.test.ts](./src/data/__tests__/models.test.ts)
│   │   ├── [index.ts](./src/data/index.ts)
│   │   └── [models.ts](./src/data/models.ts)
│   ├── hooks/
│   │   ├── __tests__/
│   │   │   └── [useSWRegister.test.ts](./src/hooks/__tests__/useSWRegister.test.ts)
│   │   └── [useSWRegister.ts](./src/hooks/useSWRegister.ts)
│   ├── lib/
│   │   ├── __tests__/
│   │   │   ├── [analytics.test.ts](./src/lib/__tests__/analytics.test.ts)
│   │   │   ├── [bracket-export.test.ts](./src/lib/__tests__/bracket-export.test.ts)
│   │   │   ├── [db.test.ts](./src/lib/__tests__/db.test.ts)
│   │   │   ├── [export.test.ts](./src/lib/__tests__/export.test.ts)
│   │   │   ├── [formats.test.ts](./src/lib/__tests__/formats.test.ts)
│   │   │   ├── [import.test.ts](./src/lib/__tests__/import.test.ts)
│   │   │   ├── [match-rules.test.ts](./src/lib/__tests__/match-rules.test.ts)
│   │   │   ├── [notifications.test.ts](./src/lib/__tests__/notifications.test.ts)
│   │   │   ├── [sample-data.test.ts](./src/lib/__tests__/sample-data.test.ts)
│   │   │   ├── [scheduling.test.ts](./src/lib/__tests__/scheduling.test.ts)
│   │   │   ├── [sharing.test.ts](./src/lib/__tests__/sharing.test.ts)
│   │   │   ├── [sqlite.test.ts](./src/lib/__tests__/sqlite.test.ts)
│   │   │   ├── [standings.test.ts](./src/lib/__tests__/standings.test.ts)
│   │   │   ├── [templates-ssr.test.ts](./src/lib/__tests__/templates-ssr.test.ts)
│   │   │   ├── [templates.test.ts](./src/lib/__tests__/templates.test.ts)
│   │   │   └── [utils.test.ts](./src/lib/__tests__/utils.test.ts)
│   │   ├── [analytics.ts](./src/lib/analytics.ts)
│   │   ├── [bracket-export.ts](./src/lib/bracket-export.ts)
│   │   ├── [db.ts](./src/lib/db.ts)
│   │   ├── [export.ts](./src/lib/export.ts)
│   │   ├── [formats.ts](./src/lib/formats.ts)
│   │   ├── [import.ts](./src/lib/import.ts)
│   │   ├── [index.ts](./src/lib/index.ts)
│   │   ├── [match-rules.ts](./src/lib/match-rules.ts)
│   │   ├── [notifications.ts](./src/lib/notifications.ts)
│   │   ├── [sample-data.ts](./src/lib/sample-data.ts)
│   │   ├── [scheduling.ts](./src/lib/scheduling.ts)
│   │   ├── [sharing.ts](./src/lib/sharing.ts)
│   │   ├── [sqlite.ts](./src/lib/sqlite.ts)
│   │   ├── [standings.ts](./src/lib/standings.ts)
│   │   ├── [templates.ts](./src/lib/templates.ts)
│   │   └── [utils.ts](./src/lib/utils.ts)
│   ├── providers/
│   │   ├── __tests__/
│   │   │   ├── [DataProvider.test.tsx](./src/providers/__tests__/DataProvider.test.tsx)
│   │   │   └── [ToastProvider.test.tsx](./src/providers/__tests__/ToastProvider.test.tsx)
│   │   ├── [DataProvider.tsx](./src/providers/DataProvider.tsx)
│   │   ├── [SWProvider.tsx](./src/providers/SWProvider.tsx)
│   │   └── [ToastProvider.tsx](./src/providers/ToastProvider.tsx)
│   ├── styles/
│   │   ├── [base.css](./src/styles/base.css)
│   │   ├── [globals.css](./src/styles/globals.css)
│   │   └── [themes.css](./src/styles/themes.css)
│   └── types/
│       └── [index.ts](./src/types/index.ts)
├── src-tauri/
│   ├── capabilities/
│   │   └── [default.json](./src-tauri/capabilities/default.json)
│   ├── icons/
│   │   ├── [128x128.png](./src-tauri/icons/128x128.png)
│   │   ├── [128x128@2x.png](./src-tauri/icons/128x128@2x.png)
│   │   ├── [32x32.png](./src-tauri/icons/32x32.png)
│   │   ├── [Square107x107Logo.png](./src-tauri/icons/Square107x107Logo.png)
│   │   ├── [Square142x142Logo.png](./src-tauri/icons/Square142x142Logo.png)
│   │   ├── [Square150x150Logo.png](./src-tauri/icons/Square150x150Logo.png)
│   │   ├── [Square284x284Logo.png](./src-tauri/icons/Square284x284Logo.png)
│   │   ├── [Square30x30Logo.png](./src-tauri/icons/Square30x30Logo.png)
│   │   ├── [Square310x310Logo.png](./src-tauri/icons/Square310x310Logo.png)
│   │   ├── [Square44x44Logo.png](./src-tauri/icons/Square44x44Logo.png)
│   │   ├── [Square71x71Logo.png](./src-tauri/icons/Square71x71Logo.png)
│   │   ├── [Square89x89Logo.png](./src-tauri/icons/Square89x89Logo.png)
│   │   ├── [StoreLogo.png](./src-tauri/icons/StoreLogo.png)
│   │   ├── [create-icons.sh](./src-tauri/icons/create-icons.sh)
│   │   ├── [icon.icns](./src-tauri/icons/icon.icns)
│   │   ├── [icon.ico](./src-tauri/icons/icon.ico)
│   │   └── [icon.png](./src-tauri/icons/icon.png)
│   ├── src/
│   │   ├── [lib.rs](./src-tauri/src/lib.rs)
│   │   └── [main.rs](./src-tauri/src/main.rs)
│   ├── [Cargo.lock](./src-tauri/Cargo.lock)
│   ├── [Cargo.toml](./src-tauri/Cargo.toml)
│   ├── [build.rs](./src-tauri/build.rs)
│   └── [tauri.conf.json](./src-tauri/tauri.conf.json)
├── [AGENTS.md](./AGENTS.md)
├── [Dockerfile](./Dockerfile)
├── [LICENSE](./LICENSE)
├── [README.md](./README.md)
├── [TREE.md](./TREE.md)
├── [docker-compose.yaml](./docker-compose.yaml)
├── [eslint.config.mts](./eslint.config.mts)
├── [jest.config.ts](./jest.config.ts)
├── [jest.setup.ts](./jest.setup.ts)
├── [next.config.ts](./next.config.ts)
├── [package.json](./package.json)
├── [playwright.config.ts](./playwright.config.ts)
├── [postcss.config.mjs](./postcss.config.mjs)
└── [tsconfig.json](./tsconfig.json)
```

89 directories, 282 files
