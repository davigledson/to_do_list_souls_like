import { StyleSheet, Platform } from "react-native";


export default styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centerText: {
    marginTop: 10,
    textAlign: 'center',
  },
  errorText: {
    color: '#EF4444',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 5,
    textAlign: 'center',
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  headerIcon: {
    opacity: 0.8,
  },
  titleContainer: {
    padding: 20,
    alignItems: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  statsGrid: {
    paddingHorizontal: 20,
  },
  statCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
      },
    }),
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.8,
  },
  statSubtitle: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  progressCard: {
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 15,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
      },
    }),
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 14,
    opacity: 0.7,
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  insightsGrid: {
    paddingHorizontal: 20,
  },
  highlightCard: {
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 15,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#059669',
  },
  highlightValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  highlightSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  activityGrid: {
    paddingHorizontal: 20,
  },
  historyContainer: {
    paddingHorizontal: 20,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
    }),
  },
  historyContent: {
    marginLeft: 15,
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
    marginBottom: 2,
  },
  historyValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    opacity: 0.5,
  },
});