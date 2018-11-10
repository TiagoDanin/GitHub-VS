const github = require('fetch-github-graphql')
const Chart = require('chart.js')
const bytelabel = require('bytelabel')

async function doChart(data, id) {
	if (!data) {
		alert('User not found!')
		return
	}
	document.getElementById('hidden').className = ''
	document.getElementById(`${id}:img`).src = data.avatarUrl
	document.getElementById(`${id}:name`).innerText = data.name
	document.getElementById(`${id}:name`).href = data.url

	document.getElementById(`${id}:repos:total`).innerText = `Total: ${data.repositories.totalCount}
Size: ${bytelabel(data.repositories.totalDiskUsage * 1024, {round: true})}
Size/Total: ${bytelabel((data.repositories.totalDiskUsage * 1024 / data.repositories.totalCount), {
	round: true
})}`
	new Chart(document.getElementById(`${id}:repositories`), {
		type: 'bar',
		data: {
			labels: data.repositories.edges.map((r) => r.node.nameWithOwner),
			datasets: [{
				label: 'Stats',
				data: data.repositories.edges.map((r) => r.node.stargazers.totalCount),
				backgroundColor: [
					'rgba(255, 99, 132, 0.2)',
					'rgba(54, 162, 235, 0.2)',
					'rgba(255, 206, 86, 0.2)',
					'rgba(75, 192, 192, 0.2)',
					'rgba(255, 159, 64, 0.2)'
				],
				borderColor: [
					'rgba(255,99,132,1)',
					'rgba(54, 162, 235, 1)',
					'rgba(255, 206, 86, 1)',
					'rgba(75, 192, 192, 1)',
					'rgba(255, 159, 64, 1)'
				],
				borderWidth: 1
			}]
		},
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true
					}
				}]
			}
		}
	})

	var totalOpens = data.issues.totalCount + data.pullRequests.totalCount
	document.getElementById(`${id}:opens:total`).innerText = `Total: ${totalOpens}`
	new Chart(document.getElementById(`${id}:opens`), {
		type: "doughnut",
		data: {
			labels: [
				'Issues',
				'Pull Requests'
			],
			datasets: [{
				label: '',
				data: [
					data.issues.totalCount,
					data.pullRequests.totalCount
				],
				backgroundColor: [
					'rgb(255, 99, 132)',
					'rgb(255, 205, 86)'
				]
			}]
		},
		options: {
			animation: {
				animateRotate: true
			}
		}
	})

	new Chart(document.getElementById(`${id}:etc`), {
		type: "horizontalBar",
		data: {
			labels: [
				"Gists",
				"Organizations",
				"Followers",
				"Following",
				"Stars",
				"Watch"
			],
			datasets: [{
				label: 'Total',
				data: [
					data.gists.totalCount,
					data.organizations.totalCount,
					data.followers.totalCount,
					data.following.totalCount,
					data.starredRepositories.totalCount,
					data.watching.totalCount
				],
				fill: false,
				backgroundColor: [
					'rgba(255, 99, 132, 0.2)',
					'rgba(255, 159, 64, 0.2)',
					'rgba(255, 205, 86, 0.2)',
					'rgba(75, 192, 192, 0.2)',
					'rgba(54, 162, 235, 0.2)',
					'rgba(153, 102, 255, 0.2)'
				],
				borderColor: [
					'rgb(255, 99, 132)',
					'rgb(255, 159, 64)',
					'rgb(255, 205, 86)',
					'rgb(75, 192, 192)',
					'rgb(54, 162, 235)',
					'rgb(153, 102, 255)'
				],
				borderWidth: 1
			}]
		},
		options: {
			scales: {
				xAxes: [{
					ticks: {
						beginAtZero: true
					}
				}]
			}
		}
	});
}

async function getData() {
	var token = document.getElementById('token').value
	var res = await github(token, `
		query one ($one: String!, $two: String!) {
			one: user(login: $one) {
			...search
			},
			two: user(login: $two) {
			...search
			}
		}

		fragment search on User {
			name,
			url,
			avatarUrl(size: 60),
			repositories(
				first: 5,
				orderBy:{
				field: STARGAZERS,
				direction: DESC,
				}
			) {
				edges {
				node {
					nameWithOwner,
					stargazers {
						totalCount
					}
				}
				}
				totalCount,
				totalDiskUsage
			},
			repositoriesContributedTo() {
				totalCount,
			},
			gists() {
				totalCount
			}
			organizations() {
				totalCount
			},
			starredRepositories() {
				totalCount
			},
			watching() {
				totalCount
			}
			issues() {
				totalCount
			},
			pullRequests() {
				totalCount
			},
			followers() {
				totalCount
			},
			following() {
				totalCount
			}
		}
	`, {
		one: document.getElementById('one:user').value,
		two: document.getElementById('two:user').value
	})

	if (!res || !res.data) {
		alert('Falid requests, see the dev tools')
		return
	}

	doChart(res.data.one, 'one')
	doChart(res.data.two, 'two')
}

document.getElementById('bt:check').addEventListener('click', getData, false)
